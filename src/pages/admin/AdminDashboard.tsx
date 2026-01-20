import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/hooks/useUsers';
import { useClassrooms } from '@/hooks/useClassrooms';
import { useChildren } from '@/hooks/useChildren';
import { Users, GraduationCap, Baby, Building, ChevronRight, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: classrooms = [], isLoading: loadingClassrooms } = useClassrooms();
  const { data: children = [], isLoading: loadingChildren } = useChildren();

  const teachers = users.filter(u => u.role === 'teacher');
  const parents = users.filter(u => u.role === 'parent');

  const isLoading = loadingUsers || loadingClassrooms || loadingChildren;

  return (
    <DashboardLayout>
      <PageHeader title="Compo Admin" description="System overview and management" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </>
        ) : (
          <>
            <StatCard title="Total Students" value={children.length} icon={Baby} variant="primary" />
            <StatCard title="Teachers" value={teachers.length} icon={GraduationCap} variant="success" />
            <StatCard title="Parents" value={parents.length} icon={Users} variant="accent" />
            <StatCard title="Classrooms" value={classrooms.length} icon={Building} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classrooms */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Classrooms</CardTitle>
            <Link to="/admin/classrooms"><Button variant="ghost" size="sm">Manage <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
          </CardHeader>
          <CardContent>
            {loadingClassrooms ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : classrooms.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No classrooms yet</p>
            ) : (
              <div className="space-y-3">
                {classrooms.slice(0, 5).map(room => {
                  const studentCount = children.filter(c => c.classroom_id === room.id).length;
                  return (
                    <div key={room.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-sm text-muted-foreground">{room.age_group || 'No age group'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{studentCount}/{room.capacity || 20}</p>
                        <p className="text-xs text-muted-foreground">students</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
