import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChildren } from '@/hooks/useChildren';
import { useWellbeingReports, useCreateWellbeingReport } from '@/hooks/useWellbeingReports';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  AlertTriangle,
  Thermometer,
  Activity,
  HelpCircle,
  Camera,
  Send,
  Bell,
  Loader2,
} from 'lucide-react';
import { cn, getFullName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const incidentTypes = [
  { value: 'injury', label: 'Injury', icon: AlertTriangle, color: 'text-destructive' },
  { value: 'illness', label: 'Illness', icon: Thermometer, color: 'text-warning' },
  { value: 'behavior', label: 'Behavior', icon: Activity, color: 'text-info' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-muted-foreground' },
];

const severityLevels = [
  { value: 'low', label: 'Low', color: 'bg-success' },
  { value: 'medium', label: 'Medium', color: 'bg-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive' },
];

const WellbeingReportsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: reports = [], isLoading: reportsLoading } = useWellbeingReports();
  const createWellbeingReport = useCreateWellbeingReport();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [incidentType, setIncidentType] = useState('injury');
  const [severity, setSeverity] = useState('low');
  const [notifyParent, setNotifyParent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    actionTaken: '',
  });

  const handleSubmit = async () => {
    if (!selectedChild || !user || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      await createWellbeingReport.mutateAsync({
        child_id: selectedChild,
        created_by: user.id,
        report_date: formData.date,
        incident_type: incidentType,
        severity: severity,
        description: formData.description,
        action_taken: formData.actionTaken || null,
        parent_notified: notifyParent,
      });
      
      toast({
        title: 'Report submitted!',
        description: notifyParent
          ? 'Parents have been notified immediately.'
          : 'Report saved successfully.',
      });
      
      setShowForm(false);
      setSelectedChild('');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        actionTaken: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Wellbeing Reports"
        description="Document and track incidents, illnesses, and behavioral notes"
        actions={
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        }
      />

      {/* New Report Form */}
      {showForm && (
        <Card className="mb-6 shadow-card border-warning/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="h-5 w-5" />
              New Wellbeing Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Child Selection */}
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {getFullName(child.first_name, child.last_name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedChild && (
              <>
                {/* Incident Type */}
                <div className="space-y-2">
                  <Label>Incident Type</Label>
                  <div className="flex gap-2 flex-wrap">
                    {incidentTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setIncidentType(type.value)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-xl transition-all btn-bounce border',
                          incidentType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <type.icon className={cn('h-4 w-4', type.color)} />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe what happened in detail..."
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                {/* Severity */}
                <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <div className="flex gap-2">
                    {severityLevels.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setSeverity(level.value)}
                        className={cn(
                          'flex-1 py-3 rounded-xl transition-all btn-bounce font-medium',
                          severity === level.value
                            ? `${level.color} text-white shadow-lg`
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Taken */}
                <div className="space-y-2">
                  <Label>Action Taken</Label>
                  <Textarea
                    placeholder="Describe the actions taken to address the situation..."
                    value={formData.actionTaken}
                    onChange={e =>
                      setFormData({ ...formData, actionTaken: e.target.value })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload photos if applicable
                    </p>
                    <Button variant="secondary" size="sm" className="mt-3">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Notify Parent */}
                <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-xl">
                  <Checkbox
                    id="notifyParent"
                    checked={notifyParent}
                    onCheckedChange={(checked) => setNotifyParent(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="notifyParent" className="cursor-pointer font-medium">
                      Notify parent immediately
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send an instant notification to the parent about this incident
                    </p>
                  </div>
                  <Bell className="h-5 w-5 text-warning" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1 gap-2"
                    disabled={isSubmitting || !formData.description}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Report
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past Reports */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map(report => {
                const child = children.find(c => c.id === report.child_id);
                const typeInfo = incidentTypes.find(t => t.value === report.incident_type);

                return (
                  <div
                    key={report.id}
                    className={cn(
                      'p-4 rounded-xl border',
                      report.severity === 'high'
                        ? 'bg-destructive/5 border-destructive/20'
                        : report.severity === 'medium'
                        ? 'bg-warning/5 border-warning/20'
                        : 'bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {typeInfo && (
                            <typeInfo.icon className={cn('h-4 w-4', typeInfo.color)} />
                          )}
                          <span className="font-semibold">
                            {child ? getFullName(child.first_name, child.last_name) : 'Unknown'}
                          </span>
                          <Badge
                            className={cn(
                              report.severity === 'high'
                                ? 'bg-destructive text-destructive-foreground'
                                : report.severity === 'medium'
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-success text-success-foreground'
                            )}
                          >
                            {report.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-2">{report.description}</p>
                        {report.action_taken && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Action taken:</strong> {report.action_taken}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{format(new Date(report.report_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        Reported on {format(new Date(report.created_at || ''), 'MMM d, h:mm a')}
                      </span>
                      {report.parent_notified && (
                        <span className="text-xs text-success flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          Parent notified
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No reports yet</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default WellbeingReportsPage;
