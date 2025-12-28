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
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenByParent, mockAnnouncements, mockActivityLogs, mockDocuments, mockMessages } from '@/lib/mockData';
import { Baby, FileText, MessageSquare, Bell, ChevronRight, AlertTriangle } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const children = getChildrenByParent('parent-1');
  const recentAnnouncements = mockAnnouncements.slice(0, 2);
  const pendingDocs = mockDocuments.filter(d => d.status === 'pending' || d.status === 'expired');
  const unreadMessages = mockMessages.filter(m => !m.read).length;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <DashboardLayout>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}! 👋`}
        description="Here's what's happening with your little ones today"
      />

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {children.map(child => {
          const todayLog = mockActivityLogs.find(l => l.childId === child.id && l.date === '2024-12-28');
          return (
            <Link key={child.id} to={`/parent/child/${child.id}`}>
              <Card className="shadow-card card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {getInitials(child.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">{child.age} years old</p>
                      {todayLog && (
                        <Badge className="mt-2 bg-success-light text-success">
                          Activity logged today
                        </Badge>
                      )}
                    </div>
                    {child.allergies.length > 0 && (
                      <div className="text-warning">
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Unread Messages" value={unreadMessages} icon={MessageSquare} variant="primary" />
        <StatCard title="Pending Docs" value={pendingDocs.length} icon={FileText} variant="warning" />
        <StatCard title="Announcements" value={recentAnnouncements.length} icon={Bell} />
        <StatCard title="My Children" value={children.length} icon={Baby} variant="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Today's Activities</CardTitle>
            <Link to="/parent/activities">
              <Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {mockActivityLogs.slice(0, 2).map(log => (
              <ActivityCard key={log.id} activity={log} showChildName className="mb-4" />
            ))}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Announcements</CardTitle>
            <Link to="/parent/announcements">
              <Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnnouncements.map(ann => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
