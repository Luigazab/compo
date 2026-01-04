import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { AnnouncementCard } from '@/components/ui/announcement-card';
import { ChildCard } from '@/components/ui/child-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherClassroom } from '@/hooks/useClassrooms';
import { useChildren } from '@/hooks/useChildren';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import {
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  MessageSquare,
  Bell,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Get teacher's classroom
  const { data: teacherClassroom, isLoading: classroomLoading } = useTeacherClassroom(user?.id);
  const { data: classroomChildren = [], isLoading: childrenLoading } = useChildren(teacherClassroom?.id);
  
  // Get today's activity logs
  const today = new Date().toISOString().split('T')[0];
  const { data: todaysLogs = [] } = useActivityLogs(undefined, today);
  
  // Get announcements
  const { data: announcements = [] } = useAnnouncements(teacherClassroom?.id);
  const recentAnnouncements = announcements.slice(0, 2);
  
  // Calculate stats
  const totalStudents = classroomChildren.length;
  const loggedToday = todaysLogs.filter(log => 
    classroomChildren.some(child => child.id === log.child_id)
  );
  
  const quickActions = [
    { label: 'Log Activity', href: '/teacher/activity-logs', icon: ClipboardList, color: 'bg-primary' },
    { label: 'Send Message', href: '/teacher/messages', icon: MessageSquare, color: 'bg-accent' },
    { label: 'Announcement', href: '/teacher/announcements', icon: Bell, color: 'bg-success' },
  ];

  const isLoading = classroomLoading || childrenLoading;

  return (
    <DashboardLayout>
      <PageHeader
        title={`Good morning, ${user?.full_name?.split(' ')[0]}! 👋`}
        description="Here's what's happening in your classroom today"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={isLoading ? '-' : totalStudents}
          subtitle={teacherClassroom?.name || 'No classroom'}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Present Today"
          value={isLoading ? '-' : totalStudents}
          subtitle="Checked in"
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Absent"
          value={0}
          subtitle="Not checked in"
          icon={UserX}
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
        {/* My Classroom */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">My Classroom</CardTitle>
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
            ) : classroomChildren.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students in your classroom yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {classroomChildren.slice(0, 4).map(child => (
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

      {/* Recent Announcements */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Announcements</CardTitle>
          <Link to="/teacher/announcements">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={{
                  id: announcement.id,
                  title: announcement.title,
                  content: announcement.content,
                  authorId: announcement.created_by,
                  targetAudience: 'everyone',
                  priority: (announcement.priority as 'low' | 'normal' | 'high') || 'normal',
                  isPinned: announcement.is_pinned || false,
                  createdAt: announcement.created_at || '',
                  readBy: [],
                  eventDate: announcement.event_date || undefined,
                }} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No announcements yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
