import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useParentChildren } from '@/hooks/useChildren';
import { useParentActivityLogs, useToggleAcknowledgement } from '@/hooks/useActivityLogs';
import { useSendActivityMessage } from '@/hooks/useMessages';
import { useUser } from '@/hooks/useUsers';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Printer, 
  Heart, 
  MessageSquare,
  Clock,
  Moon,
  Smile,
  Frown,
  Zap,
  Battery,
  ChevronDown,
  Filter,
  Image as ImageIcon,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { format, isWithinInterval, parseISO, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ActivityFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: children = [], isLoading: loadingChildren } = useParentChildren(user?.id);
  
  // Memoize child IDs to prevent unnecessary re-renders
  const childIds = useMemo(() => children.map(c => c.id), [children]);
  
  // Only fetch activities when we have child IDs
  const { data: activityLogs = [], isLoading: loadingActivities } = useParentActivityLogs(childIds);
  
  const toggleAcknowledgement = useToggleAcknowledgement();
  const sendActivityMessage = useSendActivityMessage();

  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  
  // Comment dialog state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [commentText, setCommentText] = useState('');

  // Apply filters
  const filteredActivities = useMemo(() => {
    return activityLogs.filter(log => {
      // Child filter
      const matchesChild = selectedChild === 'all' || log.child_id === selectedChild;
      
      // Date filter
      const logDate = parseISO(log.log_date);
      const matchesDate = dateRange.from && dateRange.to 
        ? isWithinInterval(logDate, { start: dateRange.from, end: dateRange.to })
        : true;
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        log.activities?.toLowerCase().includes(searchLower) ||
        log.general_notes?.toLowerCase().includes(searchLower) ||
        log.mood?.toLowerCase().includes(searchLower);
      
      return matchesChild && matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  }, [activityLogs, selectedChild, dateRange, searchQuery]);

  const getMoodIcon = (mood: string | null) => {
    const icons = {
      happy: <Smile className="h-5 w-5 text-mood-happy" />,
      sad: <Frown className="h-5 w-5 text-mood-sad" />,
      energetic: <Zap className="h-5 w-5 text-mood-energetic" />,
      tired: <Battery className="h-5 w-5 text-mood-tired" />,
      calm: <Heart className="h-5 w-5 text-mood-calm" />
    };
    return icons[mood as keyof typeof icons] || icons.happy;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleToggleLike = async (activity: any) => {
    try {
      await toggleAcknowledgement.mutateAsync({
        activityId: activity.id,
        isAcknowledged: activity.is_acknowledged || false
      });
      toast.success(activity.is_acknowledged ? 'Acknowledgement removed' : 'Activity acknowledged!');
    } catch (error: any) {
      toast.error('Failed to update acknowledgement');
    }
  };

  const handleCommentClick = (activity: any) => {
    setSelectedActivity(activity);
    setCommentDialogOpen(true);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !selectedActivity || !user?.id) return;

    const child = children.find(c => c.id === selectedActivity.child_id);
    if (!child) return;

    try {
      await sendActivityMessage.mutateAsync({
        senderId: user.id,
        recipientId: selectedActivity.created_by,
        childId: selectedActivity.child_id,
        activityDate: format(parseISO(selectedActivity.log_date), 'MMM d, yyyy'),
        content: commentText
      });
      
      toast.success('Message sent to teacher');
      setCommentDialogOpen(false);
      setCommentText('');
      setSelectedActivity(null);
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  const handleDownloadPhoto = (url: string, activityDate: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-photo-${activityDate}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handlePrintSummary = () => {
    toast.info('Preparing print summary...');
    window.print();
  };

  const clearFilters = () => {
    setSelectedChild('all');
    setSearchQuery('');
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date()
    });
  };

  const hasActiveFilters = selectedChild !== 'all' || searchQuery.length > 0;

  // Show loading state while children are loading
  if (loadingChildren) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading your children...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no children
  if (!loadingChildren && children.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No children found</p>
            <p className="text-sm text-muted-foreground">Please contact your daycare administrator</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
        <PageHeader
          title="Activity Feed"
          description="View your children's daily activities and milestones"
        />

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search activities, notes, or moods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label='close button'
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select child" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Children</SelectItem>
                    {children.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange.from && dateRange.to 
                        ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                        : 'Select dates'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}

                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrintSummary}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Summary
                  </Button>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {loadingActivities ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading activities...
                  </span>
                ) : (
                  <>Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}</>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {loadingActivities ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading activities...</p>
            </CardContent>
          </Card>
        ) : filteredActivities.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-2">
                {hasActiveFilters || searchQuery 
                  ? 'No activities found matching your search criteria.' 
                  : 'No activities logged yet for the selected date range.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map(activity => {
            const child = children.find(c => c.id === activity.child_id);
            const isAcknowledged = activity.is_acknowledged || false;
            const hasPhoto = activity.activity_media_url && activity.activity_media_url.trim().length > 0;

            return (
              <Card key={activity.id} className="shadow-card card-hover">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {child ? getInitials(`${child.first_name} ${child.last_name}`) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {child ? `${child.first_name} ${child.last_name}` : 'Unknown Child'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(activity.log_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-muted rounded-xl">
                        {getMoodIcon(activity.mood)}
                      </div>
                      <span className="text-sm font-medium capitalize">{activity.mood || 'Happy'}</span>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {(activity.arrival_time || activity.pickup_time) && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {activity.arrival_time || 'Not recorded'} - {activity.pickup_time || 'Present'}
                      </span>
                    )}
                    {activity.nap_duration && (
                      <span className="flex items-center gap-1">
                        <Moon className="h-4 w-4" />
                        Nap: {activity.nap_duration}
                      </span>
                    )}
                    {activity.bathroom_notes && (
                      <Badge variant="secondary" className="text-xs">
                        Bathroom notes
                      </Badge>
                    )}
                  </div>

                  {/* Activities Description */}
                  {activity.activities && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-1">Activities</h4>
                      <p className="text-foreground">{activity.activities}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {activity.general_notes && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm italic text-muted-foreground">
                        "{activity.general_notes}"
                      </p>
                    </div>
                  )}

                  {/* Bathroom Notes */}
                  {activity.bathroom_notes && (
                    <div className="text-sm text-muted-foreground mb-4">
                      <span className="font-medium">Bathroom: </span>
                      {activity.bathroom_notes}
                    </div>
                  )}

                  {/* Photo */}
                  {hasPhoto && (
                    <div className="mb-4">
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={activity.activity_media_url} 
                          alt={`Activity from ${activity.log_date}`}
                          className="w-full max-h-96 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(activity)}
                        className={cn(isAcknowledged && "text-pink-600")}
                        disabled={toggleAcknowledgement.isPending}
                      >
                        <Heart className={cn("h-4 w-4 mr-1", isAcknowledged && "fill-current")} />
                        {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCommentClick(activity)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comment
                      </Button>
                      {hasPhoto && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadPhoto(activity.activity_media_url, activity.log_date)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    <TeacherInfo teacherId={activity.created_by} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Teacher</DialogTitle>
            <DialogDescription>
              {selectedActivity && (
                <>
                  Regarding activity on {format(parseISO(selectedActivity.log_date), 'MMMM d, yyyy')} for{' '}
                  {children.find(c => c.id === selectedActivity.child_id)?.first_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Type your message here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendComment}
              disabled={!commentText.trim() || sendActivityMessage.isPending}
            >
              {sendActivityMessage.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Separate component to fetch teacher info
const TeacherInfo: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const { data: teacher } = useUser(teacherId);
  
  return (
    <span className="text-xs text-muted-foreground">
      Logged by {teacher?.full_name || 'Staff'}
    </span>
  );
};

export default ActivityFeedPage;