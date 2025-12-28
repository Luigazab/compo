import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ActivityCard } from '@/components/ui/activity-card';
import { MealCard } from '@/components/ui/meal-card';
import {
  getChildById,
  getClassroomById,
  getUserById,
  getActivityLogsByChild,
  getMealLogsByChild,
  getWellbeingReportsByChild,
  getDocumentsByChild,
} from '@/lib/mockData';
import {
  ArrowLeft,
  Phone,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  Heart,
  Utensils,
  FileText,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  
  const child = getChildById(studentId || '');
  const classroom = child ? getClassroomById(child.classroomId) : null;
  const activityLogs = getActivityLogsByChild(studentId || '');
  const mealLogs = getMealLogsByChild(studentId || '');
  const wellbeingReports = getWellbeingReportsByChild(studentId || '');
  const documents = getDocumentsByChild(studentId || '');
  
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'expired');

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
              {getInitials(child.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{child.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {child.age} years old
                  </span>
                  <span>•</span>
                  <Badge variant="secondary">{classroom?.name}</Badge>
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
            {child.allergies.length > 0 && (
              <div className="mt-4 p-3 bg-warning-light rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning-foreground">Allergies</p>
                  <p className="text-sm text-warning-foreground/80">
                    {child.allergies.join(', ')}
                    {child.medicalNotes && ` • ${child.medicalNotes}`}
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
                    <ActivityCard key={log.id} activity={log} />
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
              {mealLogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mealLogs.map(meal => (
                    <MealCard key={meal.id} meal={meal} />
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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive-light flex items-center justify-center">
                    <User className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold">{child.emergencyContact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {child.emergencyContact.relationship}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${child.emergencyContact.phone}`}
                  className="block w-full text-center py-2 px-4 bg-destructive-light text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors"
                >
                  {child.emergencyContact.phone}
                </a>
              </div>
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
                          {report.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.date), 'MMM d')}
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
              <div className="space-y-2">
                {documents.slice(0, 4).map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm truncate flex-1">{doc.name}</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
