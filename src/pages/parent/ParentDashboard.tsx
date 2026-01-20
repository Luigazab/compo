import React, { useMemo } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useParentChildren } from '@/hooks/useChildren';
import { useRecentAnnouncements, useAnnouncementsCount } from '@/hooks/useAnnouncements';
import { useTodayActivityLogs } from '@/hooks/useActivityLogs';
import { useParentDocumentsSummary } from '@/hooks/useDocuments';
import { useUnreadCount } from '@/hooks/useMessages';
import { useRecentWellbeingReports, useUnreadWellbeingReportsCount } from '@/hooks/useWellbeingReports';
import { 
  Baby, 
  FileText, 
  MessageSquare, 
  Bell, 
  ChevronRight, 
  AlertTriangle, 
  Loader2, 
  Activity, 
  UtensilsCrossed, 
  Heart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: children = [], isLoading: loadingChildren } = useParentChildren(user?.id);
  
  // Memoize child IDs to prevent unnecessary re-renders
  const childrenIds = useMemo(() => children.map(c => c.id), [children]);
  
  // Optimized hooks - only fetch what we need
  const { data: recentAnnouncements = [], isLoading: loadingAnnouncements } = useRecentAnnouncements(2);
  const { data: announcementsCount = 0 } = useAnnouncementsCount();
  const { data: todayActivities = [], isLoading: loadingActivities } = useTodayActivityLogs(childrenIds);
  const { data: documentsSummary, isLoading: loadingDocuments } = useParentDocumentsSummary(childrenIds);
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);
  const { data: recentWellbeing = [], isLoading: loadingWellbeing } = useRecentWellbeingReports(childrenIds, 3);
  const { data: unreadWellbeingCount = 0 } = useUnreadWellbeingReportsCount(childrenIds);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Check if child has allergies
  const hasAllergies = (allergies: string | null) => {
    return allergies && allergies.trim().length > 0;
  };

  // Check which children have activity logged today
  const getChildActivityToday = (childId: string) => {
    return todayActivities.some(log => log.child_id === childId);
  };

  const navItems = [
    { 
      name: 'Activity', 
      icon: Activity, 
      path: '/parent/activities', 
      color: 'text-blue-600', 
      bg: 'bg-blue-100 dark:bg-blue-900/30' 
    },
    { 
      name: 'Meals', 
      icon: UtensilsCrossed, 
      path: '/parent/meals', 
      color: 'text-green-600', 
      bg: 'bg-green-100 dark:bg-green-900/30' 
    },
    { 
      name: 'Wellbeing', 
      icon: Heart, 
      path: '/parent/wellbeing', 
      count: unreadWellbeingCount,
      color: 'text-pink-600', 
      bg: 'bg-pink-100 dark:bg-pink-900/30' 
    },
    { 
      name: 'Documents', 
      icon: FileText, 
      path: '/parent/documents', 
      count: documentsSummary?.pendingAndExpired.length || 0, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30' 
    },
    { 
      name: 'Messages', 
      icon: MessageSquare, 
      path: '/parent/messages', 
      count: unreadCount, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100 dark:bg-purple-900/30' 
    },
    { 
      name: 'Announcements', 
      icon: Bell, 
      path: '/parent/announcements', 
      color: 'text-orange-600', 
      bg: 'bg-orange-100 dark:bg-orange-900/30' 
    }
  ];

  // Only show main loading spinner if children are loading
  if (loadingChildren) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading your dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-4 bg-[#97CFCA] md:bg-transparent rounded-lg mb-8 shadow-lg md:shadow-none'>
        <PageHeader
          title={`Hello, ${user?.full_name?.split(' ')[0] || 'Parent'}!`}
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
          <div className="mb-8 grid gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
            {children.map(child => {
              const hasActivityToday = getChildActivityToday(child.id);
              return (
                <Link key={child.id} to={`/parent/child/${child.id}`} className='flex-1'>
                  <Card className="shadow-card card-hover h-full">
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

        {/* Mobile Navigation Grid */}
        <div className="block md:hidden">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group cursor-pointer">
                  <div className={cn('p-3 rounded-full', item.bg, 'group-hover:scale-110 transition-transform relative')}>
                    <item.icon className={cn('h-8 w-8', item.color)} />
                    {item.count !== undefined && item.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-center text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Stats */}
        <div className='hidden md:block'>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="My Children" 
              value={children.length} 
              icon={Baby} 
              variant="primary" 
            />
            <StatCard 
              title="Unread Messages" 
              value={unreadCount} 
              icon={MessageSquare} 
              variant="accent" 
            />
            <StatCard 
              title="Pending Docs" 
              value={documentsSummary?.pendingAndExpired.length || 0} 
              icon={FileText} 
              variant="warning" 
            />
            <StatCard 
              title="Announcements" 
              value={announcementsCount} 
              icon={Bell} 
              variant='success'
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Activities */}
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
            {loadingActivities ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Loading activities...</p>
              </div>
            ) : todayActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
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

        {/* Wellbeing/Incident Reports */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Wellbeing Reports
            </CardTitle>
            <Link to="/parent/wellbeing">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingWellbeing ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Loading reports...</p>
              </div>
            ) : recentWellbeing.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                <p>No recent incidents or reports</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWellbeing.slice(0, 2).map(report => {
                  const child = children.find(c => c.id === report.child_id);
                  
                  const severityColors = {
                    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  };
                  
                  const incidentIcons = {
                    injury: '🤕',
                    illness: '🤒',
                    behavior: '😤',
                    other: '📋'
                  };
                  
                  return (
                    <div 
                      key={report.id} 
                      className={cn(
                        "p-4 rounded-lg border",
                        !report.parent_notified && "border-l-4 border-l-pink-500"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {incidentIcons[report.incident_type as keyof typeof incidentIcons] || '📋'}
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm capitalize">
                              {report.incident_type || 'Incident'}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {child ? `${child.first_name} ${child.last_name}` : 'Unknown'} • {report.report_date}
                            </p>
                          </div>
                        </div>
                        {report.severity && (
                          <Badge className={severityColors[report.severity as keyof typeof severityColors]}>
                            {report.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{report.description}</p>
                      {!report.parent_notified && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-pink-600 dark:text-pink-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>New report</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {recentWellbeing.length > 2 && (
                  <p className="text-sm text-center text-muted-foreground">
                    +{recentWellbeing.length - 2} more report{recentWellbeing.length - 2 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              Documents
            </CardTitle>
            <Link to="/parent/documents">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingDocuments ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : !documentsSummary || documentsSummary.all.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No documents found</p>
              </div>
            ) : documentsSummary.pendingAndExpired.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                <p className="font-medium text-green-700 dark:text-green-400">All documents up to date!</p>
                <p className="text-sm mt-2">
                  {documentsSummary.all.length} document{documentsSummary.all.length !== 1 ? 's' : ''} on file
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documentsSummary.pendingAndExpired.slice(0, 3).map(doc => {
                  const child = children.find(c => c.id === doc.child_id);
                  return (
                    <div 
                      key={doc.id} 
                      className={cn(
                        "p-4 rounded-lg border",
                        doc.status === 'expired' 
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{doc.document_type}</h4>
                          <p className="text-xs text-muted-foreground">
                            {child ? `${child.first_name} ${child.last_name}` : 'Unknown'}
                          </p>
                          {doc.due_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {doc.status === 'expired' ? 'Expired' : `Due: ${doc.due_date}`}
                            </p>
                          )}
                        </div>
                        <Badge 
                          className={cn(
                            doc.status === 'expired' 
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          )}
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {documentsSummary.pendingAndExpired.length > 3 && (
                  <p className="text-sm text-center text-muted-foreground">
                    +{documentsSummary.pendingAndExpired.length - 3} more pending
                  </p>
                )}
              </div>
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
            {loadingAnnouncements ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Loading announcements...</p>
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
                    priority: (ann.priority as 'low' | 'normal' | 'high') || 'normal',
                    createdAt: ann.created_at || new Date().toISOString(),
                    authorId: ann.created_at,
                    isPinned: ann.is_pinned || false,
                    targetAudience: 'everyone',
                    readBy: []
                  }} 
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents Alert - Only show if there are urgent items */}
      {documentsSummary && documentsSummary.pendingAndExpired.length > 0 && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Action Required: Pending Documents
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  You have {documentsSummary.pendingAndExpired.length} document{documentsSummary.pendingAndExpired.length !== 1 ? 's' : ''} that {documentsSummary.pendingAndExpired.length !== 1 ? 'need' : 'needs'} your attention.
                </p>
                <Link to="/parent/documents">
                  <Button variant="outline" size="sm" className="bg-white hover:bg-yellow-50 dark:bg-yellow-900 dark:hover:bg-yellow-800">
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