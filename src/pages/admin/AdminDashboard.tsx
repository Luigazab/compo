import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockUsers, mockClassrooms, mockChildren } from '@/lib/mockData';
import { Users, GraduationCap, Baby, Building, ChevronRight, TrendingUp, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const teachers = mockUsers.filter(u => u.role === 'teacher');
  const parents = mockUsers.filter(u => u.role === 'parent');

  return (
    <DashboardLayout>
      <PageHeader title="Admin Dashboard" description="System overview and management" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Students" value={mockChildren.length} icon={Baby} variant="primary" trend={{ value: 12, isPositive: true }} />
        <StatCard title="Teachers" value={teachers.length} icon={GraduationCap} variant="success" />
        <StatCard title="Parents" value={parents.length} icon={Users} variant="accent" />
        <StatCard title="Classrooms" value={mockClassrooms.length} icon={Building} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classrooms */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Classrooms</CardTitle>
            <Link to="/admin/classrooms"><Button variant="ghost" size="sm">Manage <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockClassrooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-semibold">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.ageGroup}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{room.studentCount}/{room.capacity}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add User', href: '/admin/users', icon: Users },
              { label: 'Add Student', href: '/admin/students', icon: Baby },
              { label: 'New Classroom', href: '/admin/classrooms', icon: Building },
              { label: 'View Reports', href: '/admin/reports', icon: Activity },
            ].map(action => (
              <Link key={action.label} to={action.href}>
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <action.icon className="h-6 w-6" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
