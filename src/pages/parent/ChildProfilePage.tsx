import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityCard } from '@/components/ui/activity-card';
import { MealCard } from '@/components/ui/meal-card';
import { 
  getChildById, 
  getClassroomById, 
  getUserById,
  getActivityLogsByChild,
  getMealLogsByChild,
  getWellbeingReportsByChild,
  getDocumentsByChild
} from '@/lib/mockData';
import { 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  Phone,
  Mail,
  Clock,
  FileText,
  Heart,
  Utensils,
  ClipboardList,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const ChildProfilePage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const child = getChildById(childId || '');
  const classroom = child ? getClassroomById(child.classroomId) : null;
  const teacher = classroom ? getUserById(classroom.teacherId) : null;
  
  const activityLogs = child ? getActivityLogsByChild(child.id) : [];
  const mealLogs = child ? getMealLogsByChild(child.id) : [];
  const wellbeingReports = child ? getWellbeingReportsByChild(child.id) : [];
  const documents = child ? getDocumentsByChild(child.id) : [];

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getDocStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
      case 'submitted':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'rejected':
      case 'expired':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-success/10 text-success',
      medium: 'bg-warning/10 text-warning',
      high: 'bg-destructive/10 text-destructive'
    };
    return styles[severity as keyof typeof styles] || styles.low;
  };

  if (!child) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Child not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={child.name}
        description="View your child's profile and history"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="shadow-card lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials(child.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{child.name}</h2>
              <p className="text-muted-foreground">{child.age} years old</p>
              <p className="text-sm text-muted-foreground">
                DOB: {format(parseISO(child.dateOfBirth), 'MMMM d, yyyy')}
              </p>
            </div>

            {/* Allergies */}
            {child.allergies.length > 0 && (
              <div className="mb-6 p-4 bg-warning/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-semibold text-warning">Allergies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {child.allergies.map(allergy => (
                    <Badge key={allergy} variant="outline" className="border-warning text-warning">
                      {allergy}
                    </Badge>
                  ))}
                </div>
                {child.medicalNotes && (
                  <p className="text-sm text-muted-foreground mt-2">{child.medicalNotes}</p>
                )}
              </div>
            )}

            {/* Classroom Info */}
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-semibold mb-2">Classroom</h3>
                <p className="text-foreground">{classroom?.name}</p>
                <p className="text-sm text-muted-foreground">{classroom?.ageGroup}</p>
              </div>

              {teacher && (
                <div className="p-4 bg-muted rounded-xl">
                  <h3 className="font-semibold mb-2">Teacher</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(teacher.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                  </div>
                  <Link to="/parent/messages">
                    <Button className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Contact Teacher
                    </Button>
                  </Link>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-semibold mb-2">Emergency Contact</h3>
                <p className="font-medium">{child.emergencyContact.name}</p>
                <p className="text-sm text-muted-foreground">{child.emergencyContact.relationship}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{child.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Card className="shadow-card lg:col-span-2">
          <Tabs defaultValue="activities" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="activities" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Activities</span>
                </TabsTrigger>
                <TabsTrigger value="meals" className="gap-2">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">Meals</span>
                </TabsTrigger>
                <TabsTrigger value="wellbeing" className="gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Wellbeing</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="activities" className="mt-0 space-y-4">
                {activityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No activity logs yet</p>
                ) : (
                  activityLogs.map(log => (
                    <ActivityCard key={log.id} activity={log} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="meals" className="mt-0 space-y-4">
                {mealLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No meal logs yet</p>
                ) : (
                  mealLogs.map(meal => (
                    <MealCard key={meal.id} meal={{
                      id: meal.id,
                      childId: meal.childId,
                      date: meal.date,
                      mealType: meal.mealType,
                      foods: meal.foodItems,
                      portionEaten: meal.portionConsumed,
                      notes: meal.notes,
                    }} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="wellbeing" className="mt-0 space-y-4">
                {wellbeingReports.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No wellbeing reports</p>
                ) : (
                  wellbeingReports.map(report => (
                    <div key={report.id} className="p-4 bg-muted rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className={getSeverityBadge(report.severity)}>
                            {report.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {report.type}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(report.date), 'MMM d, yyyy')} at {report.time}
                        </span>
                      </div>
                      <p className="text-foreground mb-2">{report.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Action taken:</strong> {report.actionTaken}
                      </p>
                      {report.acknowledged && (
                        <Badge className="mt-2 bg-success/10 text-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-0 space-y-3">
                {documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No documents</p>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        {getDocStatusIcon(doc.status)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{doc.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          doc.status === 'approved' && 'bg-success/10 text-success',
                          doc.status === 'pending' && 'bg-warning/10 text-warning',
                          doc.status === 'submitted' && 'bg-primary/10 text-primary',
                          doc.status === 'rejected' && 'bg-destructive/10 text-destructive',
                          doc.status === 'expired' && 'bg-destructive/10 text-destructive'
                        )}>
                          {doc.status}
                        </Badge>
                        {doc.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {format(parseISO(doc.dueDate), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChildProfilePage;
