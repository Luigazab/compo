import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  getChildrenByParent, 
  mockWellbeingReports, 
  getChildById, 
  getUserById,
  WellbeingReport 
} from '@/lib/mockData';
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
  Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const WellbeingReportsPage: React.FC = () => {
  const children = getChildrenByParent('parent-1');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<WellbeingReport | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [acknowledgedReports, setAcknowledgedReports] = useState<Set<string>>(new Set());

  const childIds = children.map(c => c.id);

  // For demo, we'll add more mock reports
  const allReports: WellbeingReport[] = [
    ...mockWellbeingReports,
    {
      id: 'report-3',
      childId: 'child-5',
      date: '2024-12-28',
      time: '11:15',
      type: 'behavior',
      description: 'Sophia had difficulty sharing toys during playtime today.',
      severity: 'low',
      actionTaken: 'Had a gentle conversation about sharing and taking turns. She understood and did better later.',
      photos: [],
      parentNotified: true,
      acknowledged: false,
      teacherId: 'teacher-1'
    }
  ];

  const filteredReports = allReports.filter(report => {
    const matchesChild = selectedChild === 'all' ? childIds.includes(report.childId) : report.childId === selectedChild;
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesChild && matchesSeverity && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getTypeIcon = (type: WellbeingReport['type']) => {
    const icons = {
      injury: <AlertTriangle className="h-5 w-5" />,
      illness: <Thermometer className="h-5 w-5" />,
      behavior: <Brain className="h-5 w-5" />,
      other: <HelpCircle className="h-5 w-5" />
    };
    return icons[type];
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return colors[severity as keyof typeof colors] || colors.low;
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

  const handleDownload = (report: WellbeingReport) => {
    toast({
      title: "Downloading report",
      description: `Report from ${format(parseISO(report.date), 'MMM d, yyyy')} is being downloaded.`
    });
  };

  const handlePrint = (report: WellbeingReport) => {
    toast({
      title: "Preparing to print",
      description: "The report is being prepared for printing."
    });
    window.print();
  };

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
                  <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
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
            const child = getChildById(report.childId);
            const teacher = getUserById(report.teacherId);
            const isAcknowledged = report.acknowledged || acknowledgedReports.has(report.id);

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
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{child?.name}</h3>
                          <Badge className={cn(
                            'capitalize',
                            report.severity === 'low' && 'bg-success text-success-foreground',
                            report.severity === 'medium' && 'bg-warning text-warning-foreground',
                            report.severity === 'high' && 'bg-destructive text-destructive-foreground'
                          )}>
                            {report.severity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {report.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(parseISO(report.date), 'EEEE, MMMM d, yyyy')} at {report.time}
                        </p>
                        <p className="text-foreground mb-3">{report.description}</p>
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-sm">
                            <strong>Action taken:</strong> {report.actionTaken}
                          </p>
                        </div>
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
                        <Button variant="outline" size="icon" onClick={() => handlePrint(report)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Reported by {teacher?.name}
                      </p>
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
                  Regarding: {getChildById(selectedReport.childId)?.name}'s {selectedReport.type} report
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

export default WellbeingReportsPage;
