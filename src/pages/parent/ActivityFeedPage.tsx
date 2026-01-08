import React, { useState } from 'react';
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
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useParentChildren } from '@/hooks/useChildren';
import { useActivityLogs } from '@/hooks/useActivityLogs';
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
import { useToast } from '@/hooks/use-toast';

const ActivityFeedPage: React.FC = () => {
  const { profile } = useSupabaseAuth();
  const { data: children = [], isLoading: loadingChildren } = useParentChildren(profile?.id);
  const { data: activityLogs = [], isLoading: loadingActivities } = useActivityLogs();
  const { toast } = useToast();

  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set());

  const childIds = children.map(c => c.id);
  
  // Filter activities for this parent's children
  const myActivities = activityLogs.filter(log => childIds.includes(log.child_id));

  // Apply filters
  const filteredActivities = myActivities.filter(log => {
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

  const toggleLike = (activityId: string) => {
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
    toast({
      title: likedActivities.has(activityId) ? "Reaction removed" : "Activity liked!",
      description: "Your reaction has been recorded."
    });
  };

  const handleDownloadPhotos = (activityId: string, date: string) => {
    toast({
      title: "Download started",
      description: `Downloading photos from ${format(parseISO(date), 'MMM d, yyyy')}`
    });
  };

  const handlePrintSummary = () => {
    toast({
      title: "Preparing print",
      description: "Activity summary is being prepared for printing."
    });
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

  if (loadingChildren || loadingActivities) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Activity Feed"
        description="View your children's daily activities and milestones"
      />

      {/* Filters */}
      <Card className="shadow-card mb-6">
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
              Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
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
            const isLiked = likedActivities.has(activity.id);
            const hasPhotos = activity.activity_media && activity.activity_media.length > 0;

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

                  {/* Photos */}
                  {hasPhotos && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {activity.activity_media.map((media, idx) => (
                        <div key={media.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          {media.media_type === 'image' ? (
                            <img 
                              src={media.media_url} 
                              alt={media.caption || `Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(activity.id)}
                        className={cn(isLiked && "text-destructive")}
                      >
                        <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current")} />
                        {isLiked ? 'Liked' : 'Like'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comment
                      </Button>
                      {hasPhotos && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadPhotos(activity.id, activity.log_date)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download ({activity.activity_media.length})
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