import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { AnnouncementCard } from '@/components/ui/announcement-card';
import { ActivityCard } from '@/components/ui/activity-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useParentChildren } from '@/hooks/useChildren';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useDocuments } from '@/hooks/useDocuments';
import { useUnreadCount } from '@/hooks/useMessages';
import { useUser } from '@/hooks/useUsers';
import { Baby, FileText, MessageSquare, Bell, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const { profile } = useSupabaseAuth();
  const { data: children = [], isLoading: loadingChildren } = useParentChildren(profile?.id);
  const { data: announcements = [], isLoading: loadingAnnouncements } = useAnnouncements();
  const { data: activityLogs = [], isLoading: loadingActivities } = useActivityLogs();
  const { data: allDocuments = [], isLoading: loadingDocuments } = useDocuments();
  const { data: unreadCount = 0 } = useUnreadCount(profile?.id);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter documents for this parent's children
  const childrenIds = children.map(c => c.id);
  const myDocuments = allDocuments.filter(doc => childrenIds.includes(doc.child_id));
  const pendingDocs = myDocuments.filter(d => d.status === 'pending' || d.status === 'expired');

  // Filter activity logs for this parent's children
  const myActivityLogs = activityLogs.filter(log => childrenIds.includes(log.child_id));
  
  // Get today's activities
  const todayActivities = myActivityLogs.filter(log => log.log_date === today);

  // Get recent announcements (limit to 2)
  const recentAnnouncements = announcements.slice(0, 2);

  // Check which children have activity logged today
  const getChildActivityToday = (childId: string) => {
    return todayActivities.some(log => log.child_id === childId);
  };

  // Check if child has allergies
  const hasAllergies = (allergies: string | null) => {
    return allergies && allergies.trim().length > 0;
  };

  const isLoading = loadingChildren || loadingAnnouncements || loadingActivities || loadingDocuments;

  if (isLoading) {
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
        title={`Hello, ${profile?.full_name?.split(' ')[0] || 'Parent'}!`}
        description="Here's what's happening with your little ones today"
      />

      {/* Children Cards */}
      {children.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="text-center py-12">
            <Baby className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Children Found</h3>
            <p className="text-muted-foreground">
              Please contact the daycare administrator to link your children to your account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {children.map(child => {
            const hasActivityToday = getChildActivityToday(child.id);
            return (
              <Link key={child.id} to={`/parent/child/${child.id}`}>
                <Card className="shadow-card card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                          {getInitials(`${child.first_name} ${child.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {child.date_of_birth ? 
                            `${Math.floor((new Date().getTime() - new Date(child.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old` 
                            : 'Age not set'}
                        </p>
                        {hasActivityToday && (
                          <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                            Activity logged today
                          </Badge>
                        )}
                      </div>
                      {hasAllergies(child.allergies) && (
                        <div className="text-yellow-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Unread Messages" 
          value={unreadCount} 
          icon={MessageSquare} 
          variant="primary" 
        />
        <StatCard 
          title="Pending Docs" 
          value={pendingDocs.length} 
          icon={FileText} 
          variant="warning" 
        />
        <StatCard 
          title="Announcements" 
          value={announcements.length} 
          icon={Bell} 
        />
        <StatCard 
          title="My Children" 
          value={children.length} 
          icon={Baby} 
          variant="accent" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Today's Activities</CardTitle>
            <Link to="/parent/activities">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activities logged yet today</p>
              </div>
            ) : (
              todayActivities.slice(0, 2).map(log => {
                const child = children.find(c => c.id === log.child_id);
                return (
                  <ActivityCard 
                    key={log.id} 
                    activity={{
                      id: log.id,
                      childId: log.child_id,
                      date: log.log_date,
                      arrivalTime: log.arrival_time || undefined,
                      pickupTime: log.pickup_time || undefined,
                      activities: log.activities || '',
                      mood: log.mood || 'happy',
                      napDuration: log.nap_duration || undefined,
                      notes: log.general_notes || undefined,
                      childName: child ? `${child.first_name} ${child.last_name}` : undefined
                    }} 
                    showChildName 
                    className="mb-4" 
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Announcements</CardTitle>
            <Link to="/parent/announcements">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No announcements at this time</p>
              </div>
            ) : (
              recentAnnouncements.map(ann => (
                <AnnouncementCard 
                  key={ann.id} 
                  announcement={{
                    id: ann.id,
                    title: ann.title,
                    content: ann.content,
                    priority: ann.priority as 'low' | 'normal' | 'high',
                    createdAt: ann.created_at || new Date().toISOString(),
                    authorId: ann.created_by,
                    isPinned: ann.is_pinned || false,
                    eventDate: ann.event_date || undefined
                  }} 
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents Alert */}
      {pendingDocs.length > 0 && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Action Required: Pending Documents
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  You have {pendingDocs.length} document{pendingDocs.length !== 1 ? 's' : ''} that {pendingDocs.length !== 1 ? 'need' : 'needs'} your attention.
                </p>
                <Link to="/parent/documents">
                  <Button variant="outline" size="sm" className="bg-white hover:bg-yellow-50">
                    View Documents
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;
