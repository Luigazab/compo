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
import { 
  getChildrenByParent, 
  mockActivityLogs, 
  getChildById, 
  getUserById,
  ActivityLog 
} from '@/lib/mockData';
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
  Image as ImageIcon
} from 'lucide-react';
import { format, isWithinInterval, parseISO, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const ActivityFeedPage: React.FC = () => {
  const children = getChildrenByParent('parent-1');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set());

  const childIds = children.map(c => c.id);
  
  const filteredActivities = mockActivityLogs.filter(log => {
    const matchesChild = selectedChild === 'all' ? childIds.includes(log.childId) : log.childId === selectedChild;
    const logDate = parseISO(log.date);
    const matchesDate = dateRange.from && dateRange.to 
      ? isWithinInterval(logDate, { start: dateRange.from, end: dateRange.to })
      : true;
    return matchesChild && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getMoodIcon = (mood: ActivityLog['mood']) => {
    const icons = {
      happy: <Smile className="h-5 w-5 text-mood-happy" />,
      sad: <Frown className="h-5 w-5 text-mood-sad" />,
      energetic: <Zap className="h-5 w-5 text-mood-energetic" />,
      tired: <Battery className="h-5 w-5 text-mood-tired" />,
      calm: <Heart className="h-5 w-5 text-mood-calm" />
    };
    return icons[mood];
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

  const handleDownloadPhotos = (activity: ActivityLog) => {
    toast({
      title: "Download started",
      description: `Downloading photos from ${format(parseISO(activity.date), 'MMM d, yyyy')}`
    });
  };

  const handlePrintSummary = () => {
    toast({
      title: "Preparing print",
      description: "Daily summary is being prepared for printing."
    });
    window.print();
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Activity Feed"
        description="View your children's daily activities and milestones"
      />

      {/* Filters */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
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
                  <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
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

            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrintSummary}>
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No activities found for the selected filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map(activity => {
            const child = getChildById(activity.childId);
            const teacher = getUserById(activity.teacherId);
            const isLiked = likedActivities.has(activity.id);

            return (
              <Card key={activity.id} className="shadow-card card-hover">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {child ? getInitials(child.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{child?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(activity.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-muted rounded-xl">
                        {getMoodIcon(activity.mood)}
                      </div>
                      <span className="text-sm font-medium capitalize">{activity.mood}</span>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {activity.arrivalTime} - {activity.pickupTime || 'Present'}
                    </span>
                    {activity.napDuration && (
                      <span className="flex items-center gap-1">
                        <Moon className="h-4 w-4" />
                        Nap: {activity.napDuration}
                      </span>
                    )}
                  </div>

                  {/* Activities Description */}
                  <p className="text-foreground mb-4">{activity.activities}</p>

                  {/* Notes */}
                  {activity.generalNotes && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm italic text-muted-foreground">
                        "{activity.generalNotes}"
                      </p>
                    </div>
                  )}

                  {/* Photos Placeholder */}
                  {activity.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {activity.photos.map((photo, idx) => (
                        <div key={idx} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
                      {activity.photos.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPhotos(activity)}>
                          <Download className="h-4 w-4 mr-1" />
                          Photos
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Logged by {teacher?.name}
                    </span>
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

export default ActivityFeedPage;
