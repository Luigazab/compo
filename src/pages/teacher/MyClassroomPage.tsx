import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ChildCard } from '@/components/ui/child-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherClassroom } from '@/hooks/useClassrooms';
import { useChildren } from '@/hooks/useChildren';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Search, Filter, Users } from 'lucide-react';

const MyClassroomPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Get teacher's classroom
  const { data: teacherClassroom, isLoading: classroomLoading } = useTeacherClassroom(user?.id);
  const { data: classroomChildren = [], isLoading: childrenLoading } = useChildren(teacherClassroom?.id);
  
  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  const { data: todaysLogs = [] } = useActivityLogs(undefined, today);
  
  // Filter children
  const filteredChildren = classroomChildren.filter(child => {
    const fullName = `${child.first_name} ${child.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const hasLog = todaysLogs.some(log => log.child_id === child.id);
    
    if (statusFilter === 'logged') return matchesSearch && hasLog;
    if (statusFilter === 'pending') return matchesSearch && !hasLog;
    
    return matchesSearch;
  });

  const isLoading = classroomLoading || childrenLoading;

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
      <PageHeader
        title="My Classroom"
        description={teacherClassroom ? `${teacherClassroom.name} • ${teacherClassroom.age_group || 'All ages'}` : 'Loading...'}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3.5 w-3.5" />
              {classroomChildren.length} students
            </Badge>
          </div>
        }
      />
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="logged">Activity Logged</SelectItem>
              <SelectItem value="pending">Pending Log</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredChildren.map(child => {
            const hasLog = todaysLogs.some(log => log.child_id === child.id);
            return (
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
                logStatus={hasLog ? 'completed' : 'pending'}
                linkTo={`/teacher/students/${child.id}`}
              />
            );
          })}
        </div>
      )}

      {!isLoading && filteredChildren.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found matching your criteria.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyClassroomPage;
