import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { AnnouncementCard } from '@/components/ui/announcement-card';
import { ChildCard } from '@/components/ui/child-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockChildren,
  mockAnnouncements,
  mockClassrooms,
  mockActivityLogs,
} from '@/lib/mockData';
import {
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  MessageSquare,
  Bell,
  Plus,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Get teacher's classroom
  const teacherClassroom = mockClassrooms.find(c => c.teacherId === 'teacher-1');
  const classroomChildren = mockChildren.filter(c => c.classroomId === teacherClassroom?.id);
  
  // Today's stats
  const totalStudents = classroomChildren.length;
  const presentStudents = 6; // Mock data
  const absentStudents = totalStudents - presentStudents;
  
  // Activity log status
  const todaysLogs = mockActivityLogs.filter(
    log => log.date === '2024-12-28' && log.status === 'published'
  );
  
  // Recent announcements
  const recentAnnouncements = mockAnnouncements.slice(0, 2);
  
  // Quick actions
  const quickActions = [
    { label: 'Log Activity', href: '/teacher/activity-logs', icon: ClipboardList, color: 'bg-primary' },
    { label: 'Send Message', href: '/teacher/messages', icon: MessageSquare, color: 'bg-accent' },
    { label: 'Announcement', href: '/teacher/announcements', icon: Bell, color: 'bg-success' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ')[0]}! 👋`}
        description="Here's what's happening in your classroom today"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle={teacherClassroom?.name}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Present Today"
          value={presentStudents}
          subtitle="Checked in"
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Absent"
          value={absentStudents}
          subtitle="Not checked in"
          icon={UserX}
          variant="warning"
        />
        <StatCard
          title="Activities Logged"
          value={`${todaysLogs.length}/${totalStudents}`}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {classroomChildren.slice(0, 4).map(child => (
                <ChildCard
                  key={child.id}
                  child={child}
                  showLogStatus
                  logStatus={todaysLogs.find(l => l.childId === child.id) ? 'completed' : 'pending'}
                  linkTo={`/teacher/students/${child.id}`}
                />
              ))}
            </div>
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
              <div className="flex items-center gap-3 p-3 bg-warning-light rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-warning flex flex-col items-center justify-center text-warning-foreground">
                  <span className="text-xs font-medium">DEC</span>
                  <span className="text-lg font-bold">29</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Pajama Day</p>
                  <p className="text-xs text-muted-foreground">Special activity day</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-info-light rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-info flex flex-col items-center justify-center text-info-foreground">
                  <span className="text-xs font-medium">JAN</span>
                  <span className="text-lg font-bold">10</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Photo Day</p>
                  <p className="text-xs text-muted-foreground">Class photos</p>
                </div>
              </div>
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
            {recentAnnouncements.map(announcement => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
