import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ChildCard } from '@/components/ui/child-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockChildren, mockClassrooms, mockActivityLogs } from '@/lib/mockData';
import { Search, Filter, Users } from 'lucide-react';

const MyClassroomPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Get teacher's classroom (mock: using first classroom)
  const teacherClassroom = mockClassrooms[0];
  const classroomChildren = mockChildren.filter(c => c.classroomId === teacherClassroom?.id);
  
  // Get today's logs
  const todaysLogs = mockActivityLogs.filter(log => log.date === '2024-12-28');
  
  // Filter children
  const filteredChildren = classroomChildren.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const hasLog = todaysLogs.some(log => log.childId === child.id && log.status === 'published');
    
    if (statusFilter === 'logged') return matchesSearch && hasLog;
    if (statusFilter === 'pending') return matchesSearch && !hasLog;
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="My Classroom"
        description={`${teacherClassroom?.name} • ${teacherClassroom?.ageGroup}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3.5 w-3.5" />
              {classroomChildren.length} students
            </Badge>
          </div>
        }
      />

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredChildren.map(child => {
          const hasLog = todaysLogs.some(
            log => log.childId === child.id && log.status === 'published'
          );
          return (
            <ChildCard
              key={child.id}
              child={child}
              showLogStatus
              logStatus={hasLog ? 'completed' : 'pending'}
              linkTo={`/teacher/students/${child.id}`}
            />
          );
        })}
      </div>

      {filteredChildren.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found matching your criteria.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyClassroomPage;
