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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useUsers } from '@/hooks/useUsers';
import { useChildren } from '@/hooks/useChildren';
import { useChildParents } from '@/hooks/useChildParent';
import { useClassrooms } from '@/hooks/useClassrooms';
import { 
  Pin,
  Calendar as CalendarIcon,
  Download,
  Filter,
  AlertCircle,
  Megaphone,
  PartyPopper
} from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ParentAnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const { data: users = [] } = useUsers();
  const { data: children = [] } = useChildren();
  const { data: childParentLinks = [] } = useChildParents();
  const { data: classrooms = [] } = useClassrooms();

  // Get parent's children's classroom IDs
  const parentChildren = children.filter(child => 
    childParentLinks.some(cp => cp.parent_id === user?.id && cp.child_id === child.id)
  );
  const classroomIds = parentChildren.map(c => c.classroom_id).filter(Boolean);
  
  // Get announcements for those classrooms
  const { data: announcements = [], isLoading } = useAnnouncements();

  // Filter announcements relevant to parent
  const relevantAnnouncements = announcements.filter(ann => 
    ann.classroom_id === null || classroomIds.includes(ann.classroom_id)
  );

  const filteredAnnouncements = relevantAnnouncements
    .filter(ann => {
      const matchesPriority = priorityFilter === 'all' || ann.priority === priorityFilter;
      const matchesDate = !selectedDate || 
        (ann.event_date && isSameDay(parseISO(ann.event_date), selectedDate));
      return matchesPriority && matchesDate;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);
  const eventsWithDates = relevantAnnouncements.filter(a => a.event_date);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getPriorityColor = (priority: string | null) => {
    const colors: Record<string, string> = {
      low: 'bg-muted text-muted-foreground',
      normal: 'bg-primary/10 text-primary',
      high: 'bg-destructive/10 text-destructive'
    };
    return colors[priority || 'normal'] || colors.normal;
  };

  const getAuthorName = (authorId: string) => {
    const author = users.find(u => u.id === authorId);
    return author?.full_name || 'Unknown';
  };

  const handleExportEvent = (ann: any) => {
    toast.success(`"${ann.title}" added to calendar`);
  };

  return (
    <DashboardLayout>
      <div className='p-4 bg-[#97CFCA] md:bg-transparent rounded-lg mb-8 shadow-lg md:shadow-none'>
      <PageHeader
        title="Announcements"
        description="Stay updated with news from the daycare"
      />

      {/* View Toggle and Filters */}
      <Card className="shadow-card">
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
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === 'list' ? (
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
                  onExport={() => handleExportEvent(ann)}
                  getInitials={getInitials}
                  getPriorityColor={getPriorityColor}
                  getAuthorName={getAuthorName}
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
                  onExport={() => handleExportEvent(ann)}
                  getInitials={getInitials}
                  getPriorityColor={getPriorityColor}
                  getAuthorName={getAuthorName}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Events Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto w-full max-w-[350px] flex justify-center"
                modifiers={{
                  hasEvent: eventsWithDates.map(e => parseISO(e.event_date!))
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
                .filter(e => !selectedDate || isSameDay(parseISO(e.event_date!), selectedDate))
                .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
                .map(ann => (
                  <div key={ann.id} className="p-4 bg-muted rounded-xl mb-4 last:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <PartyPopper className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{ann.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(ann.event_date!), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportEvent(ann)}
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Add to Calendar
                      </Button> */}
                    </div>
                    <p className="text-sm text-foreground">{ann.content}</p>
                  </div>
                ))}
              {eventsWithDates.filter(e => !selectedDate || isSameDay(parseISO(e.event_date!), selectedDate)).length === 0 && (
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
  announcement: any;
  onExport: () => void;
  getInitials: (name: string) => string;
  getPriorityColor: (priority: string | null) => string;
  getAuthorName: (authorId: string) => string;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onExport,
  getInitials,
  getPriorityColor,
  getAuthorName
}) => {
  return (
    <Card className={cn('shadow-card', announcement.is_pinned && 'border-l-4 border-l-primary')}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {announcement.is_pinned && (
            <Pin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                    <span className="capitalize">{announcement.priority || 'normal'}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(new Date(announcement.created_at || ''), 'MMM d, yyyy')}</span>
                  {announcement.event_date && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Event: {format(parseISO(announcement.event_date), 'MMM d, yyyy')}
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
                    {getInitials(getAuthorName(announcement.created_by))}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {getAuthorName(announcement.created_by)}
                </span>
              </div>
              {/* <div className="flex items-center gap-2">
                {announcement.event_date && (
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Add to Calendar
                  </Button>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentAnnouncementsPage;
