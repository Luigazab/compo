import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useParentChildren } from '@/hooks/useChildren';
import { useWellbeingReports } from '@/hooks/useWellbeingReports';
import { useUser } from '@/hooks/useUsers';
import { 
  Filter,
  CheckCircle,
  Download,
  Printer,
  MessageSquare,
  AlertTriangle,
  Thermometer,
  Brain,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const WellbeingReportsPage: React.FC = () => {
  const { profile } = useSupabaseAuth();
  const { data: children = [], isLoading: loadingChildren } = useParentChildren(profile?.id);
  const { data: allReports = [], isLoading: loadingReports } = useWellbeingReports();
  
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [acknowledgedReports, setAcknowledgedReports] = useState<Set<string>>(new Set());

  const childIds = children.map(c => c.id);

  // Filter reports for this parent's children
  const myReports = allReports.filter(report => childIds.includes(report.child_id));

  const filteredReports = myReports.filter(report => {
    const matchesChild = selectedChild === 'all' || report.child_id === selectedChild;
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
    const matchesType = typeFilter === 'all' || report.incident_type === typeFilter;
    return matchesChild && matchesSeverity && matchesType;
  }).sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getTypeIcon = (type: string | null) => {
    const icons: Record<string, React.ReactNode> = {
      injury: <AlertTriangle className="h-5 w-5" />,
      illness: <Thermometer className="h-5 w-5" />,
      behavior: <Brain className="h-5 w-5" />,
      other: <HelpCircle className="h-5 w-5" />
    };
    return icons[type || 'other'] || icons.other;
  };

  const getSeverityColor = (severity: string | null) => {
    const colors: Record<string, string> = {
      low: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return colors[severity || 'low'] || colors.low;
  };

  const handleAcknowledge = (reportId: string) => {
    setAcknowledgedReports(prev => new Set([...prev, reportId]));
    toast({
      title: "Report acknowledged",
      description: "Thank you for acknowledging this report."
    });
  };

  const handleReply = () => {
    if (!replyMessage.trim()) return;
    toast({
      title: "Reply sent",
      description: "Your message has been sent to the teacher."
    });
    setReplyMessage('');
    setReplyDialogOpen(false);
    setSelectedReport(null);
  };

  const handleDownload = (report: any) => {
    toast({
      title: "Downloading report",
      description: `Report from ${format(new Date(report.report_date), 'MMM d, yyyy')} is being downloaded.`
    });
  };

  const handlePrint = () => {
    toast({
      title: "Preparing to print",
      description: "The report is being prepared for printing."
    });
    window.print();
  };

  const isLoading = loadingChildren || loadingReports;

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
      <PageHeader
        title="Wellbeing Reports"
        description="View health, behavior, and incident reports for your children"
      />

      {/* Filters */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="injury">Injury</SelectItem>
                <SelectItem value="illness">Illness</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No wellbeing reports found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map(report => {
            const child = children.find(c => c.id === report.child_id);
            const isAcknowledged = report.parent_notified || acknowledgedReports.has(report.id);

            return (
              <Card key={report.id} className={cn('shadow-card', getSeverityColor(report.severity))}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Icon and Child Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        'p-3 rounded-xl',
                        report.severity === 'low' && 'bg-success/20',
                        report.severity === 'medium' && 'bg-warning/20',
                        report.severity === 'high' && 'bg-destructive/20'
                      )}>
                        {getTypeIcon(report.incident_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {child ? `${child.first_name} ${child.last_name}` : 'Unknown'}
                          </h3>
                          <Badge className={cn(
                            'capitalize',
                            report.severity === 'low' && 'bg-success text-success-foreground',
                            report.severity === 'medium' && 'bg-warning text-warning-foreground',
                            report.severity === 'high' && 'bg-destructive text-destructive-foreground'
                          )}>
                            {report.severity || 'low'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {report.incident_type || 'other'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(new Date(report.report_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-foreground mb-3">{report.description}</p>
                        {report.action_taken && (
                          <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm">
                              <strong>Action taken:</strong> {report.action_taken}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {!isAcknowledged ? (
                        <Button onClick={() => handleAcknowledge(report.id)} className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Acknowledge
                        </Button>
                      ) : (
                        <Badge className="justify-center py-2 bg-success/10 text-success">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedReport(report); setReplyDialogOpen(true); }}
                        className="gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Reply
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handlePrint}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                      <ReporterInfo reporterId={report.created_by} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Teacher</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedReport && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Regarding: {children.find(c => c.id === selectedReport.child_id)?.first_name}'s {selectedReport.incident_type} report
                </p>
                <p className="text-sm">{selectedReport.description}</p>
              </div>
            )}
            <Textarea
              placeholder="Type your message to the teacher..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReply} disabled={!replyMessage.trim()}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Separate component to fetch reporter info
const ReporterInfo: React.FC<{ reporterId: string }> = ({ reporterId }) => {
  const { data: reporter } = useUser(reporterId);
  
  return (
    <p className="text-xs text-muted-foreground text-center">
      Reported by {reporter?.full_name || 'Staff'}
    </p>
  );
};

export default WellbeingReportsPage;
