import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  mockAnnouncements, 
  getUserById,
  getChildrenByParent,
  getClassroomById,
  Announcement 
} from '@/lib/mockData';
import { 
  Bell,
  Pin,
  Calendar as CalendarIcon,
  Download,
  Eye,
  EyeOff,
  Filter,
  AlertCircle,
  Megaphone,
  PartyPopper
} from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const ParentAnnouncementsPage: React.FC = () => {
  const children = getChildrenByParent('parent-1');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [readAnnouncements, setReadAnnouncements] = useState<Set<string>>(
    new Set(['ann-1', 'ann-2'])
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Get classroom IDs for filtering
  const classroomIds = new Set(children.map(c => c.classroomId));

  // Extended announcements
  const allAnnouncements: Announcement[] = [
    ...mockAnnouncements,
    {
      id: 'ann-4',
      title: 'Parent-Teacher Conference',
      content: 'Please sign up for your preferred time slot for the upcoming parent-teacher conferences on January 15th.',
      authorId: 'admin-1',
      targetAudience: 'all_parents',
      priority: 'high',
      eventDate: '2025-01-15',
      isPinned: false,
      createdAt: '2024-12-28',
      readBy: []
    },
    {
      id: 'ann-5',
      title: 'Art Show Next Week',
      content: 'Join us for our annual Winter Art Show showcasing your childrens creative work!',
      authorId: 'teacher-1',
      targetAudience: 'my_classroom',
      priority: 'normal',
      eventDate: '2025-01-08',
      isPinned: false,
      createdAt: '2024-12-27',
      readBy: []
    }
  ];

  const filteredAnnouncements = allAnnouncements
    .filter(ann => {
      const matchesPriority = priorityFilter === 'all' || ann.priority === priorityFilter;
      const matchesAudience = audienceFilter === 'all' || 
        ann.targetAudience === 'everyone' || 
        ann.targetAudience === 'all_parents' ||
        (ann.targetAudience === 'my_classroom');
      const matchesDate = !selectedDate || 
        (ann.eventDate && isSameDay(parseISO(ann.eventDate), selectedDate));
      return matchesPriority && matchesAudience && matchesDate;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  const eventsWithDates = allAnnouncements.filter(a => a.eventDate);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-muted text-muted-foreground',
      normal: 'bg-primary/10 text-primary',
      high: 'bg-destructive/10 text-destructive'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle className="h-4 w-4" />;
    return null;
  };

  const handleMarkAsRead = (annId: string) => {
    setReadAnnouncements(prev => new Set([...prev, annId]));
  };

  const handleExportEvent = (ann: Announcement) => {
    toast({
      title: "Event exported",
      description: `"${ann.title}" has been added to your calendar.`
    });
  };

  const unreadCount = allAnnouncements.filter(a => !readAnnouncements.has(a.id)).length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Announcements"
        description="Stay updated with news from the daycare"
      />

      {/* View Toggle and Filters */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="my_classroom">My Classroom</SelectItem>
                  <SelectItem value="all_parents">General</SelectItem>
                </SelectContent>
              </Select>

              {unreadCount > 0 && (
                <Badge className="bg-primary">{unreadCount} unread</Badge>
              )}
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <Megaphone className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin className="h-5 w-5 text-primary" />
                Pinned
              </h2>
              {pinnedAnnouncements.map(ann => (
                <AnnouncementCard 
                  key={ann.id}
                  announcement={ann}
                  isRead={readAnnouncements.has(ann.id)}
                  onMarkAsRead={() => handleMarkAsRead(ann.id)}
                  onExport={() => handleExportEvent(ann)}
                  getInitials={getInitials}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                />
              ))}
            </div>
          )}

          {/* Regular Announcements */}
          <div className="space-y-4">
            {pinnedAnnouncements.length > 0 && (
              <h2 className="text-lg font-semibold">All Announcements</h2>
            )}
            {regularAnnouncements.length === 0 && pinnedAnnouncements.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No announcements found.</p>
                </CardContent>
              </Card>
            ) : (
              regularAnnouncements.map(ann => (
                <AnnouncementCard 
                  key={ann.id}
                  announcement={ann}
                  isRead={readAnnouncements.has(ann.id)}
                  onMarkAsRead={() => handleMarkAsRead(ann.id)}
                  onExport={() => handleExportEvent(ann)}
                  getInitials={getInitials}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Calendar View - Responsive Layout */
        <div className="space-y-6">
          {/* Calendar - Full width on mobile, side panel on desktop */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Events Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto w-full max-w-[350px]"
                modifiers={{
                  hasEvent: eventsWithDates.map(e => parseISO(e.eventDate!))
                }}
                modifiersStyles={{
                  hasEvent: { 
                    fontWeight: 'bold', 
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    color: 'hsl(var(--primary))'
                  }
                }}
              />
            </CardContent>
            {selectedDate && (
              <div className="px-6 pb-4">
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setSelectedDate(undefined)}
                >
                  Clear selection
                </Button>
              </div>
            )}
          </Card>

          {/* Events List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate 
                  ? `Events on ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'Upcoming Events'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsWithDates
                .filter(e => !selectedDate || isSameDay(parseISO(e.eventDate!), selectedDate))
                .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
                .map(ann => (
                  <div key={ann.id} className="p-4 bg-muted rounded-xl mb-4 last:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PartyPopper className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{ann.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(ann.eventDate!), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportEvent(ann)}
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Add to Calendar
                      </Button>
                    </div>
                    <p className="text-sm text-foreground">{ann.content}</p>
                  </div>
                ))}
              {eventsWithDates.filter(e => !selectedDate || isSameDay(parseISO(e.eventDate!), selectedDate)).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No events {selectedDate ? 'on this date' : 'scheduled'}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

// Announcement Card Component
interface AnnouncementCardProps {
  announcement: Announcement;
  isRead: boolean;
  onMarkAsRead: () => void;
  onExport: () => void;
  getInitials: (name: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isRead,
  onMarkAsRead,
  onExport,
  getInitials,
  getPriorityColor,
  getPriorityIcon
}) => {
  const author = getUserById(announcement.authorId);

  return (
    <Card className={cn('shadow-card', !isRead && 'border-l-4 border-l-primary')}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {announcement.isPinned && (
            <Pin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {getPriorityIcon(announcement.priority)}
                    <span className="ml-1 capitalize">{announcement.priority}</span>
                  </Badge>
                  {!isRead && (
                    <Badge className="bg-primary">New</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(parseISO(announcement.createdAt), 'MMM d, yyyy')}</span>
                  {announcement.eventDate && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Event: {format(parseISO(announcement.eventDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-foreground mb-4">{announcement.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {author ? getInitials(author.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {author?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isRead && (
                  <Button variant="ghost" size="sm" onClick={onMarkAsRead}>
                    <Eye className="h-4 w-4 mr-1" />
                    Mark as read
                  </Button>
                )}
                {announcement.eventDate && (
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Add to Calendar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentAnnouncementsPage;
