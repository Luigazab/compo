import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ChildCard } from '@/components/ui/child-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherClassrooms } from '@/hooks/useTeacherClassrooms';
import { useChildrenByClassrooms } from '@/hooks/useChildren';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useMealLogs } from '@/hooks/useMealLogs';
import { useWellbeingReports } from '@/hooks/useWellbeingReports';
import { useMessages } from '@/hooks/useMessages';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import {
  Users,
  ClipboardList,
  MessageSquare,
  Bell,
  ChevronRight,
  Calendar,
  Utensils,
  AlertTriangle,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Get all teacher's classrooms (both primary and co-teacher)
  const { data: teacherAssignments = [], isLoading: classroomsLoading } = useTeacherClassrooms(user?.id);
  
  // Extract all classroom IDs
  const allClassroomIds = useMemo(() => 
    teacherAssignments.map(assignment => assignment.classroom.id),
    [teacherAssignments]
  );
  
  // Get all children from all assigned classrooms
  const { data: allChildren = [], isLoading: childrenLoading } = useChildrenByClassrooms(allClassroomIds);
  
  // Get all child IDs
  const allChildIds = useMemo(() => allChildren.map(child => child.id), [allChildren]);
  
  // Get today's activity logs
  const today = new Date().toISOString().split('T')[0];
  const { data: todaysLogs = [] } = useActivityLogs(undefined, today);
  
  // Get today's meal logs
  const { data: allMealLogs = [] } = useMealLogs(undefined, today, today);
  const todaysMealLogs = useMemo(() => 
    allMealLogs.filter(log => allChildIds.includes(log.child_id)),
    [allMealLogs, allChildIds]
  );
  
  // Get wellbeing reports
  const { data: allWellbeingReports = [] } = useWellbeingReports();
  const pendingWellbeingReports = useMemo(() => 
    allWellbeingReports.filter(report => 
      allChildIds.includes(report.child_id) && !report.parent_notified
    ),
    [allWellbeingReports, allChildIds]
  );
  
  // Get messages for the teacher
  const { data: allMessages = [] } = useMessages(user?.id);
  const recentMessages = useMemo(() => 
    allMessages.filter(msg => msg.recipient_id === user?.id).slice(0, 3),
    [allMessages, user?.id]
  );
  
  // Get announcements
  const { data: announcements = [] } = useAnnouncements();
  
  // Calculate stats across all classrooms
  const totalStudents = allChildren.length;
  const loggedToday = todaysLogs.filter(log => 
    allChildren.some(child => child.id === log.child_id)
  );
  
  // Count unique children with meal logs today
  const childrenWithMeals = useMemo(() => {
    const uniqueChildIds = new Set(todaysMealLogs.map(log => log.child_id));
    return uniqueChildIds.size;
  }, [todaysMealLogs]);
  
  const quickActions = [
    { label: 'Log Activity', href: '/teacher/activity-logs', icon: ClipboardList, color: 'bg-primary' },
    { label: 'Send Message', href: '/teacher/messages', icon: MessageSquare, color: 'bg-accent' },
    { label: 'Announcement', href: '/teacher/announcements', icon: Bell, color: 'bg-success' },
  ];

  const isLoading = classroomsLoading || childrenLoading;

  return (
    <DashboardLayout>
      <div className='px-4 py-2 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
        <PageHeader
          title={`Good morning, ${user?.full_name?.split(' ')[0]}!`}
          description={`Managing ${teacherAssignments.length} classroom${teacherAssignments.length !== 1 ? 's' : ''} with ${totalStudents} total students`}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={isLoading ? '-' : totalStudents}
          subtitle={`Across ${teacherAssignments.length} classroom${teacherAssignments.length !== 1 ? 's' : ''}`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Meal Logs Today"
          value={isLoading ? '-' : `${childrenWithMeals}/${totalStudents}`}
          subtitle="Children fed"
          icon={Utensils}
          variant="success"
        />
        <StatCard
          title="Pending Reports"
          value={pendingWellbeingReports.length}
          subtitle="Needs parent notification"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Activities Logged"
          value={`${loggedToday.length}/${totalStudents}`}
          subtitle="Today's logs"
          icon={ClipboardList}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {quickActions.map(action => (
          <Link
            key={action.label}
            to={action.href}
            className="bg-card rounded-2xl border p-4 shadow-card card-hover flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
              <action.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All My Students */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">All My Students</CardTitle>
            <Link to="/teacher/classroom">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : allChildren.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students in your classrooms yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {allChildren.slice(0, 4).map(child => (
                  <ChildCard
                    key={child.id}
                    child={{
                      id: child.id,
                      name: `${child.first_name} ${child.last_name}`,
                      age: Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
                      dateOfBirth: child.date_of_birth,
                      classroomId: child.classroom_id || '',
                      parentIds: [],
                      allergies: child.allergies ? child.allergies.split(',').map(a => a.trim()) : [],
                      emergencyContact: { name: '', phone: '', relationship: '' },
                    }}
                    showLogStatus
                    logStatus={loggedToday.find(l => l.child_id === child.id) ? 'completed' : 'pending'}
                    linkTo={`/teacher/students/${child.id}`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements
                .filter(a => a.event_date)
                .slice(0, 2)
                .map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-info-light rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-info flex flex-col items-center justify-center text-info-foreground">
                      <span className="text-xs font-medium">
                        {new Date(event.event_date!).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(event.event_date!).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{event.content}</p>
                    </div>
                  </div>
                ))}
              {announcements.filter(a => a.event_date).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Recent Messages
          </CardTitle>
          <Link to="/teacher/messages">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMessages.length > 0 ? (
              recentMessages.map(message => (
                <Link 
                  key={message.id} 
                  to="/teacher/messages"
                  className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm">From Parent</p>
                        <div className="flex items-center gap-2">
                          {!message.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No messages yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeacherDashboard;