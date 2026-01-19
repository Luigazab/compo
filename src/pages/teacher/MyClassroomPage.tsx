import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherClassrooms } from '@/hooks/useTeacherClassrooms';
import { useChildren } from '@/hooks/useChildren';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Search, Filter, Users, GraduationCap, ArrowLeft, Baby, Calendar, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Classroom {
  id: string;
  name: string;
  age_group: string | null;
  capacity: number | null;
}

const MyClassroomPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Get teacher's classrooms
  const { data: teacherClassrooms = [], isLoading: classroomsLoading } = useTeacherClassrooms(user?.id);
  
  // Extract classroom data
  const classrooms: Classroom[] = teacherClassrooms.map((tc: any) => tc.classrooms).filter(Boolean);
  
  // Get children for selected classroom or all classrooms
  const { data: classroomChildren = [], isLoading: childrenLoading } = useChildren(
    selectedClassroom?.id || (activeTab !== 'all' ? activeTab : undefined)
  );
  
  // Get all children if viewing "all" tab
  const allClassroomIds = classrooms.map(c => c.id);
  
  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  const { data: todaysLogs = [] } = useActivityLogs(undefined, today);
  
  // Filter children based on active tab
  const getFilteredChildrenByTab = () => {
    if (!selectedClassroom) return [];
    
    if (activeTab === 'all') {
      return classroomChildren;
    }
    
    return classroomChildren.filter(child => child.classroom_id === activeTab);
  };
  
  // Apply search and status filters
  const filteredChildren = getFilteredChildrenByTab().filter(child => {
    const fullName = `${child.first_name} ${child.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const hasLog = todaysLogs.some(log => log.child_id === child.id);
    
    if (statusFilter === 'logged') return matchesSearch && hasLog;
    if (statusFilter === 'pending') return matchesSearch && !hasLog;
    
    return matchesSearch;
  });

  const isLoading = classroomsLoading || childrenLoading;
  
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Classroom Selection View
  if (!selectedClassroom) {
    return (
      <DashboardLayout>
        <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
          <PageHeader
            title="My Classrooms"
            description={`You are assigned to ${classrooms.length} classroom${classrooms.length !== 1 ? 's' : ''}`}
          />
        </div>

        {classroomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Classrooms Assigned</h3>
              <p className="text-muted-foreground">
                You haven't been assigned to any classrooms yet. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => {
              const studentCount = classroomChildren.filter(c => c.classroom_id === classroom.id).length;
              
              return (
                <Card 
                  key={classroom.id}
                  className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50"
                  onClick={() => {
                    setSelectedClassroom(classroom);
                    setActiveTab('all');
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{classroom.age_group || 'All ages'}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{classroom.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{studentCount} students</span>
                      </div>
                      {classroom.capacity && (
                        <span>Capacity: {classroom.capacity}</span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      View Classroom
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // Students Table View
  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
        <PageHeader
          title={selectedClassroom.name}
          description={`${selectedClassroom.age_group || 'All ages'} • ${filteredChildren.length} students`}
          actions={
            <Button 
              variant="outline" 
              onClick={() => setSelectedClassroom(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Classrooms
            </Button>
          }
        />
      </div>

      {/* Tabs for classroom selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All Students
          </TabsTrigger>
          {classrooms.map((classroom) => (
            <TabsTrigger 
              key={classroom.id} 
              value={classroom.id}
              className="gap-2"
              onClick={() => setSelectedClassroom(classroom)}
            >
              <GraduationCap className="h-4 w-4" />
              {classroom.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Allergies</TableHead>
                  <TableHead>Today's Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChildren.map(child => {
                  const hasLog = todaysLogs.some(log => log.child_id === child.id);
                  const age = calculateAge(child.date_of_birth);
                  
                  return (
                    <TableRow key={child.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {child.first_name[0]}{child.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{child.first_name} {child.last_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{age} years</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(child.date_of_birth), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {child.allergies ? (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">{child.allergies}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={hasLog ? 'default' : 'secondary'}>
                          {hasLog ? 'Logged' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="gap-2"
                        >
                          <Link to={`/teacher/students/${child.id}`}>
                            <Eye className="h-4 w-4" />
                            View Profile
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default MyClassroomPage;
