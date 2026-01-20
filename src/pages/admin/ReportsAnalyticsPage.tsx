import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, TrendingUp, Users, ClipboardCheck, FileCheck, Loader2 } from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { useUsers } from "@/hooks/useUsers";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useMealLogs } from "@/hooks/useMealLogs";
import { useWellbeingReports } from "@/hooks/useWellbeingReports";
import { useDocuments } from "@/hooks/useDocuments";

const ReportsAnalyticsPage = () => {
  const [dateRange, setDateRange] = useState("this-month");
  
  // Fetch real data
  const { data: children = [], isLoading: loadingChildren } = useChildren();
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: activityLogs = [], isLoading: loadingActivities } = useActivityLogs();
  const { data: mealLogs = [], isLoading: loadingMeals } = useMealLogs();
  const { data: wellbeingReports = [], isLoading: loadingReports } = useWellbeingReports();
  const { data: documents = [], isLoading: loadingDocs } = useDocuments();

  const isLoading = loadingChildren || loadingUsers || loadingActivities || loadingMeals || loadingReports || loadingDocs;

  // Calculate stats
  const teachers = users.filter(u => u.role === 'teacher');
  const parents = users.filter(u => u.role === 'parent');
  const totalStudents = children.length;
  
  // Activity completion rate
  const today = new Date().toISOString().split('T')[0];
  const todaysActivities = activityLogs.filter(log => log.log_date === today);
  const activityCompletionRate = totalStudents > 0 
    ? Math.round((todaysActivities.length / totalStudents) * 100) 
    : 0;

  // Document compliance
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const expiredDocs = documents.filter(d => d.status === 'expired').length;
  const totalDocs = documents.length;
  const complianceRate = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

  // Generate chart data from real data
  const documentComplianceData = [
    { name: "Approved", value: approvedDocs, color: "hsl(var(--primary))" },
    { name: "Pending", value: pendingDocs, color: "hsl(var(--warning))" },
    { name: "Expired", value: expiredDocs, color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0);

  // Group wellbeing reports by severity
  const wellbeingBySeverity = wellbeingReports.reduce((acc, report) => {
    const severity = report.severity || 'low';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wellbeingData = [
    { severity: "Low", count: wellbeingBySeverity['low'] || 0 },
    { severity: "Medium", count: wellbeingBySeverity['medium'] || 0 },
    { severity: "High", count: wellbeingBySeverity['high'] || 0 },
  ];

  // Meal portion stats
  const mealPortionStats = mealLogs.reduce((acc, meal) => {
    const portion = meal.portion_consumed || 'some';
    acc[portion] = (acc[portion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mealData = [
    { portion: "All", count: mealPortionStats['all'] || 0 },
    { portion: "Most", count: mealPortionStats['most'] || 0 },
    { portion: "Some", count: mealPortionStats['some'] || 0 },
    { portion: "None", count: mealPortionStats['none'] || 0 },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="Reports & Analytics"
            description="View insights and generate reports for your daycare"
          />
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {teachers.length} teachers, {parents.length} parents
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activity Logs Today</p>
                  <p className="text-2xl font-bold">{todaysActivities.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activityCompletionRate}% completion rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Document Compliance</p>
                  <p className="text-2xl font-bold">{complianceRate}%</p>
                  <p className="text-xs text-amber-600">
                    {pendingDocs} documents pending
                  </p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wellbeing Reports</p>
                  <p className="text-2xl font-bold">{wellbeingReports.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {wellbeingBySeverity['high'] || 0} high severity
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                {documentComplianceData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No documents found.</p>
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={documentComplianceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {documentComplianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellbeing">
            <Card>
              <CardHeader>
                <CardTitle>Wellbeing Reports by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                {wellbeingReports.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No wellbeing reports found.</p>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={wellbeingData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="severity" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="Reports" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals">
            <Card>
              <CardHeader>
                <CardTitle>Meal Portion Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                {mealLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No meal logs found.</p>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mealData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="portion" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="Meals" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Student Report</span>
                <span className="text-xs text-muted-foreground">PDF / Excel</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <ClipboardCheck className="h-6 w-6" />
                <span>Activity Report</span>
                <span className="text-xs text-muted-foreground">PDF / Excel</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <FileCheck className="h-6 w-6" />
                <span>Compliance Report</span>
                <span className="text-xs text-muted-foreground">PDF / Excel</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Incident Report</span>
                <span className="text-xs text-muted-foreground">PDF / Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsAnalyticsPage;
