import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ActivityCard } from '@/components/ui/activity-card';
import { MealCard } from '@/components/ui/meal-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChild } from '@/hooks/useChildren';
import { useClassroom } from '@/hooks/useClassrooms';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useMealLogs } from '@/hooks/useMealLogs';
import { useWellbeingReports } from '@/hooks/useWellbeingReports';
import { useDocuments } from '@/hooks/useDocuments';
import { getInitials, calculateAge } from '@/lib/utils';
import {
  ArrowLeft,
  Phone,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  Heart,
  Utensils,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  
  const { data: child, isLoading: childLoading } = useChild(studentId);
  const { data: classroom } = useClassroom(child?.classroom_id || undefined);
  const { data: activityLogs = [] } = useActivityLogs(studentId);
  const { data: mealLogs = [] } = useMealLogs(studentId);
  const { data: wellbeingReports = [] } = useWellbeingReports(studentId);
  const { data: documents = [] } = useDocuments(studentId);

  if (childLoading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!child) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Student not found</p>
          <Link to="/teacher/classroom">
            <Button variant="link" className="mt-4">
              Back to Classroom
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${child.first_name} ${child.last_name}`;
  const age = calculateAge(child.date_of_birth);
  const allergies = child.allergies ? child.allergies.split(',').map(a => a.trim()) : [];
  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'expired');
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = mealLogs.filter(m => m.meal_date === today);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          to="/teacher/classroom"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classroom
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-2xl border shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {age} years old
                  </span>
                  <span>•</span>
                  <Badge variant="secondary">{classroom?.name || 'No classroom'}</Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link to={`/teacher/activity-logs?child=${child.id}`}>
                  <Button className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Log Activity
                  </Button>
                </Link>
                <Link to="/teacher/messages">
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message Parent
                  </Button>
                </Link>
              </div>
            </div>

            {/* Allergies Warning */}
            {allergies.length > 0 && (
              <div className="mt-4 p-3 bg-warning-light rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning-foreground">Allergies</p>
                  <p className="text-sm text-warning-foreground/80">
                    {allergies.join(', ')}
                    {child.medical_notes && ` • ${child.medical_notes}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.slice(0, 2).map(log => (
                    <ActivityCard 
                      key={log.id} 
                      activity={{
                        id: log.id,
                        childId: log.child_id,
                        date: log.log_date,
                        arrivalTime: log.arrival_time || '',
                        pickupTime: log.pickup_time || undefined,
                        activities: log.activities || '',
                        mood: (log.mood as 'happy' | 'sad' | 'energetic' | 'tired' | 'calm') || 'calm',
                        napDuration: log.nap_duration || undefined,
                        bathroomNotes: log.bathroom_notes || undefined,
                        generalNotes: log.general_notes || undefined,
                        photos: [],
                        teacherId: log.created_by,
                        status: 'published',
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No activity logs yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meal History */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Today's Meals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayMeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todayMeals.map(meal => (
                    <MealCard 
                      key={meal.id} 
                      meal={{
                        id: meal.id,
                        childId: meal.child_id,
                        date: meal.meal_date,
                        mealType: (meal.meal_type as 'breakfast' | 'lunch' | 'snack' | 'dinner') || 'lunch',
                        foodItems: meal.food_items.split(',').map(f => f.trim()),
                        portionConsumed: (meal.portion_consumed as 'none' | 'some' | 'most' | 'all') || 'some',
                        notes: meal.notes || undefined,
                        timestamp: meal.created_at || '',
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No meals logged today
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {child.emergency_contact ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive-light flex items-center justify-center">
                      <User className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">{child.emergency_contact}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No emergency contact on file
                </p>
              )}
            </CardContent>
          </Card>

          {/* Wellbeing Reports */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Wellbeing Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wellbeingReports.length > 0 ? (
                <div className="space-y-3">
                  {wellbeingReports.slice(0, 2).map(report => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-lg ${
                        report.severity === 'high'
                          ? 'bg-destructive-light'
                          : report.severity === 'medium'
                          ? 'bg-warning-light'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          className={
                            report.severity === 'high'
                              ? 'bg-destructive text-destructive-foreground'
                              : report.severity === 'medium'
                              ? 'bg-warning text-warning-foreground'
                              : ''
                          }
                        >
                          {report.incident_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.report_date), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{report.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No recent reports
                </p>
              )}
            </CardContent>
          </Card>

          {/* Documents Status */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documents
                {pendingDocs.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingDocs.length} pending
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.slice(0, 4).map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm truncate flex-1">{doc.document_type}</span>
                      <Badge
                        className={
                          doc.status === 'approved'
                            ? 'bg-success-light text-success'
                            : doc.status === 'pending'
                            ? 'bg-warning-light text-warning-foreground'
                            : doc.status === 'expired'
                            ? 'bg-destructive-light text-destructive'
                            : ''
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No documents on file
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
