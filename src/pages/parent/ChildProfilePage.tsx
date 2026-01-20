import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityCard } from '@/components/ui/activity-card';
import { MealCard } from '@/components/ui/meal-card';
import { useChild } from '@/hooks/useChildren';
import { useClassroom } from '@/hooks/useClassrooms';
import { useUser } from '@/hooks/useUsers';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useMealLogs } from '@/hooks/useMealLogs';
import { useWellbeingReports } from '@/hooks/useWellbeingReports';
import { useDocuments } from '@/hooks/useDocuments';
import { 
  MessageSquare, 
  AlertTriangle,
  Phone,
  FileText,
  Heart,
  Utensils,
  ClipboardList,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ChildProfilePage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  
  const { data: child, isLoading: loadingChild } = useChild(childId);
  const { data: classroom } = useClassroom(child?.classroom_id || undefined);
  const { data: teacher } = useUser(classroom?.teacher_id || undefined);
  const { data: activityLogs = [], isLoading: loadingActivities } = useActivityLogs(childId);
  const { data: mealLogs = [], isLoading: loadingMeals } = useMealLogs(childId);
  const { data: wellbeingReports = [], isLoading: loadingReports } = useWellbeingReports(childId);
  const { data: documents = [], isLoading: loadingDocs } = useDocuments(childId);

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

  const getSeverityBadge = (severity: string | null) => {
    const styles = {
      low: 'bg-success/10 text-success',
      medium: 'bg-warning/10 text-warning',
      high: 'bg-destructive/10 text-destructive'
    };
    return styles[severity as keyof typeof styles] || styles.low;
  };

  if (loadingChild) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Child not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${child.first_name} ${child.last_name}`;
  const age = Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const allergies = child.allergies ? child.allergies.split(',').map(a => a.trim()) : [];

  return (
    <DashboardLayout>
      <PageHeader
        title={fullName}
        description="View your child's profile and history"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="shadow-card lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{fullName}</h2>
              <p className="text-muted-foreground">{age} years old</p>
              <p className="text-sm text-muted-foreground">
                DOB: {format(new Date(child.date_of_birth), 'MMMM d, yyyy')}
              </p>
            </div>

            {/* Allergies */}
            {allergies.length > 0 && (
              <div className="mb-6 p-4 bg-warning/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-semibold text-warning">Allergies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map(allergy => (
                    <Badge key={allergy} variant="outline" className="border-warning text-warning">
                      {allergy}
                    </Badge>
                  ))}
                </div>
                {child.medical_notes && (
                  <p className="text-sm text-muted-foreground mt-2">{child.medical_notes}</p>
                )}
              </div>
            )}

            {/* Classroom Info */}
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-semibold mb-2">Classroom</h3>
                <p className="text-foreground">{classroom?.name || 'Not assigned'}</p>
                <p className="text-sm text-muted-foreground">{classroom?.age_group || ''}</p>
              </div>

              {teacher && (
                <div className="p-4 bg-muted rounded-xl">
                  <h3 className="font-semibold mb-2">Teacher</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(teacher.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{teacher.full_name}</p>
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
              {child.emergency_contact && (
                <div className="p-4 bg-muted rounded-xl">
                  <h3 className="font-semibold mb-2">Emergency Contact</h3>
                  <p className="font-medium">{child.emergency_contact}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{child.emergency_contact}</span>
                  </div>
                </div>
              )}
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
                {loadingActivities ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                ) : activityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No activity logs yet</p>
                ) : (
                  activityLogs.slice(0, 5).map(log => (
                    <ActivityCard 
                      key={log.id} 
                      activity={{
                        id: log.id,
                        childId: log.child_id,
                        date: log.log_date,
                        arrivalTime: log.arrival_time || undefined,
                        pickupTime: log.pickup_time || undefined,
                        activities: log.activities || '',
                        mood: log.mood || 'happy',
                        napDuration: log.nap_duration || undefined,
                        notes: log.general_notes || undefined,
                      }} 
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="meals" className="mt-0 space-y-4">
                {loadingMeals ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : mealLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No meal logs yet</p>
                ) : (
                  mealLogs.slice(0, 5).map(meal => (
                    <MealCard 
                      key={meal.id} 
                      meal={{
                        id: meal.id,
                        childId: meal.child_id,
                        date: meal.meal_date,
                        mealType: meal.meal_type || 'lunch',
                        foods: meal.food_items.split(',').map(f => f.trim()),
                        portionEaten: meal.portion_consumed || 'some',
                        notes: meal.notes || undefined,
                      }} 
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="wellbeing" className="mt-0 space-y-4">
                {loadingReports ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                ) : wellbeingReports.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No wellbeing reports</p>
                ) : (
                  wellbeingReports.map(report => (
                    <div key={report.id} className="p-4 bg-muted rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className={getSeverityBadge(report.severity)}>
                            {(report.severity || 'low').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {report.incident_type || 'other'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(report.report_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-foreground mb-2">{report.description}</p>
                      {report.action_taken && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Action taken:</strong> {report.action_taken}
                        </p>
                      )}
                      {report.parent_notified && (
                        <Badge className="mt-2 bg-success/10 text-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Parent Notified
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-0 space-y-3">
                {loadingDocs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No documents</p>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        {getDocStatusIcon(doc.status || 'pending')}
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground capitalize">Required Document</p>
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
                        {doc.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {format(new Date(doc.due_date), 'MMM d, yyyy')}
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
