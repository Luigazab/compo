import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useTeacherClassrooms, TeacherClassroomAssignment } from '@/hooks/useTeacherClassrooms';
import { useChildrenByClassrooms } from '@/hooks/useChildren';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Search, Filter, Users, GraduationCap, ArrowLeft, Baby, Calendar, AlertCircle, Eye, Crown, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type Classroom = Tables<'classrooms'>;
type Child = Tables<'children'>;

export default function MyClassroomPage() {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherClassroomAssignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Get teacher's classrooms (both primary and co-teacher)
  const { data: teacherAssignments = [], isLoading: classroomsLoading } = useTeacherClassrooms(user?.id);
  
  // Extract classroom data
  const classrooms: Classroom[] = useMemo(() => 
    teacherAssignments.map((ta) => ta.classroom).filter(Boolean),
    [teacherAssignments]
  );
  
  // Get all classroom IDs for fetching children
  const allClassroomIds = useMemo(() => classrooms.map(c => c.id), [classrooms]);
  
  // Fetch all children from all assigned classrooms
  const { data: allChildren = [], isLoading: childrenLoading } = useChildrenByClassrooms(allClassroomIds);
  
  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  const { data: todaysLogs = [] } = useActivityLogs(undefined, today);
  
  // Get selected classroom from assignment
  const selectedClassroom = selectedAssignment?.classroom || null;
  
  // Filter children based on active tab
  const getFilteredChildrenByTab = useMemo(() => {
    // If "All Students" tab is active, show all children from all classrooms
    if (activeTab === 'all') {
      return allChildren;
    }
    
    // Otherwise, filter by the selected classroom tab
    return allChildren.filter(child => child.classroom_id === activeTab);
  }, [activeTab, allChildren]);
  
  // Apply search and status filters
  const filteredChildren = useMemo(() => {
    return getFilteredChildrenByTab.filter(child => {
      const fullName = `${child.first_name} ${child.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      
      const hasLog = todaysLogs.some(log => log.child_id === child.id);
      
      if (statusFilter === 'logged') return matchesSearch && hasLog;
      if (statusFilter === 'pending') return matchesSearch && !hasLog;
      
      return matchesSearch;
    });
  }, [getFilteredChildrenByTab, searchQuery, statusFilter, todaysLogs]);

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

  // Get classroom name for a child
  const getClassroomName = (classroomId: string | null) => {
    if (!classroomId) return 'Unassigned';
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom?.name || 'Unknown';
  };

  // Classroom Selection View
  if (!selectedAssignment) {
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
            {teacherAssignments.map((assignment) => {
              const classroom = assignment.classroom;
              const studentCount = allChildren.filter(c => c.classroom_id === classroom.id).length;
              
              return (
                <Card 
                  key={classroom.id}
                  className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setActiveTab('all');
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={assignment.role === 'primary' ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {assignment.role === 'primary' ? (
                            <>
                              <Crown className="h-3 w-3" />
                              Primary
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3" />
                              Co-Teacher
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="mt-3 text-lg">{classroom.name}</CardTitle>
                    <Badge variant="outline" className="w-fit mt-1">{classroom.age_group || 'All ages'}</Badge>
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
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {activeTab === 'all' ? 'All My Students' : selectedClassroom?.name}
            </h1>
            {activeTab !== 'all' && (
              <Badge 
                variant={selectedAssignment.role === 'primary' ? 'default' : 'secondary'}
                className="gap-1"
              >
                {selectedAssignment.role === 'primary' ? (
                  <>
                    <Crown className="h-3 w-3" />
                    Primary Teacher
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3" />
                    Co-Teacher
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {activeTab === 'all' 
              ? `${filteredChildren.length} students across ${classrooms.length} classroom${classrooms.length !== 1 ? 's' : ''}`
              : `${selectedClassroom?.age_group || 'All ages'} • ${filteredChildren.length} students`
            }
          </p>
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setSelectedAssignment(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classrooms
          </Button>
        </div>
      </div>

      {/* Tabs for classroom selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All Students ({allChildren.length})
          </TabsTrigger>
          {teacherAssignments.map((assignment) => {
            const classroomStudentCount = allChildren.filter(c => c.classroom_id === assignment.classroom.id).length;
            return (
              <TabsTrigger 
                key={assignment.classroom.id} 
                value={assignment.classroom.id}
                className="gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                {assignment.classroom.name} ({classroomStudentCount})
                {assignment.role === 'primary' && <Crown className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            );
          })}
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
                  {activeTab === 'all' && <TableHead>Classroom</TableHead>}
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
                      {activeTab === 'all' && (
                        <TableCell>
                          <Badge variant="outline">{getClassroomName(child.classroom_id)}</Badge>
                        </TableCell>
                      )}
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
}