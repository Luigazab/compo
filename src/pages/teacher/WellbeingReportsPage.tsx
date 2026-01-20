import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeacherClassrooms } from '@/hooks/useTeacherClassrooms';
import { useChildrenByClassrooms } from '@/hooks/useChildren';
import { useWellbeingReports, useCreateWellbeingReport, useUpdateWellbeingReport } from '@/hooks/useWellbeingReports';
import { useCreateNotification } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  AlertTriangle,
  Thermometer,
  Activity,
  HelpCircle,
  Send,
  Bell,
  Loader2,
  Edit,
  Trash2,
  Download,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { cn, getFullName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Get teacher's classrooms and children
  const { data: teacherAssignments = [] } = useTeacherClassrooms(user?.id);
  const allClassroomIds = useMemo(() => teacherAssignments.map(a => a.classroom.id), [teacherAssignments]);
  const { data: children = [], isLoading: childrenLoading } = useChildrenByClassrooms(allClassroomIds);
  const { data: reports = [], isLoading: reportsLoading } = useWellbeingReports();
  
  const createWellbeingReport = useCreateWellbeingReport();
  const updateWellbeingReport = useUpdateWellbeingReport();
  const createNotification = useCreateNotification();
  
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [deletingReport, setDeletingReport] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState('');
  const [incidentType, setIncidentType] = useState('injury');
  const [severity, setSeverity] = useState('low');
  const [notifyParent, setNotifyParent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    actionTaken: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');

  // Filter reports to only show teacher's students
  const myReports = useMemo(() => {
    return reports.filter(report => children.some(c => c.id === report.child_id));
  }, [reports, children]);

  const filteredReports = useMemo(() => {
    return myReports.filter(report => {
      const child = children.find(c => c.id === report.child_id);
      const childName = child ? `${child.first_name} ${child.last_name}`.toLowerCase() : '';
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = !searchQuery || 
        childName.includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower);
      
      const matchesChild = selectedChildFilter === 'all' || report.child_id === selectedChildFilter;
      
      return matchesSearch && matchesChild;
    }).sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());
  }, [myReports, searchQuery, selectedChildFilter, children]);

  const resetForm = () => {
    setShowForm(false);
    setEditingReport(null);
    setSelectedChild('');
    setIncidentType('injury');
    setSeverity('low');
    setNotifyParent(true);
    setPhotos([]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      actionTaken: '',
    });
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    setSelectedChild(report.child_id);
    setIncidentType(report.incident_type || 'injury');
    setSeverity(report.severity || 'low');
    setNotifyParent(false); // Don't re-notify when editing
    setFormData({
      date: report.report_date,
      description: report.description || '',
      actionTaken: report.action_taken || '',
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingReport) return;

    try {
      const { error } = await supabase
        .from('wellbeing_reports')
        .delete()
        .eq('id', deletingReport.id);

      if (error) throw error;

      toast({
        title: 'Report deleted',
        description: 'The wellbeing report has been removed.',
      });
      setDeletingReport(null);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report.',
        variant: 'destructive',
      });
    }
  };

  const notifyParents = async (childId: string, reportDate: string, reportType: string) => {
    try {
      const { data: parentLinks, error: parentError } = await supabase
        .from('child_parent')
        .select('parent_id')
        .eq('child_id', childId);

      if (parentError) throw parentError;

      const child = children.find(c => c.id === childId);
      const childName = child ? `${child.first_name} ${child.last_name}` : 'your child';

      for (const link of parentLinks || []) {
        await createNotification.mutateAsync({
          user_id: link.parent_id,
          title: 'New Wellbeing Report',
          message: `A ${reportType} report has been filed for ${childName} on ${format(new Date(reportDate), 'MMM d, yyyy')}.`,
          type: 'warning',
          link: '/parent/wellbeing-reports',
        });
      }
    } catch (error) {
      console.error('Error notifying parents:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild || !user || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      let photoUrl: string | null = null;
      
      // Upload photo if provided
      if (photos.length > 0) {
        const photo = photos[0];
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('activity-photos')
          .upload(fileName, photo);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('activity-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      if (editingReport) {
        // Update existing report
        await updateWellbeingReport.mutateAsync({
          id: editingReport.id,
          report_date: formData.date,
          incident_type: incidentType,
          severity: severity,
          description: formData.description,
          action_taken: formData.actionTaken || null,
        });

        toast({
          title: 'Report updated!',
          description: 'The wellbeing report has been updated.',
        });
      } else {
        // Create new report
        await createWellbeingReport.mutateAsync({
          child_id: selectedChild,
          created_by: user.id,
          report_date: formData.date,
          incident_type: incidentType,
          severity: severity,
          description: formData.description,
          action_taken: formData.actionTaken || null,
          parent_notified: false, // Will be set to true when parent acknowledges
          wellbeing_media_url: photoUrl,
        });

        // Notify parents
        if (notifyParent) {
          await notifyParents(selectedChild, formData.date, incidentType);
        }

        toast({
          title: 'Report submitted!',
          description: notifyParent
            ? 'Parents have been notified immediately.'
            : 'Report saved successfully.',
        });
      }
      
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error('Error saving report:', error);
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
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
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

        {/* Filters */}
        <Card className="shadow-card mt-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>
                
                <Select value={selectedChildFilter} onValueChange={setSelectedChildFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select child" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {children.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New/Edit Report Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="h-5 w-5" />
              {editingReport ? 'Edit Wellbeing Report' : 'New Wellbeing Report'}
            </DialogTitle>
            <DialogDescription>
              {editingReport ? 'Update the report details below' : 'Document an incident, illness, or behavioral note'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Child Selection */}
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild} disabled={!!editingReport}>
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
                          'flex items-center gap-2 px-4 py-2 rounded-xl transition-all border',
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
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe what happened in detail..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
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
                          'flex-1 py-3 rounded-xl transition-all font-medium',
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
                    placeholder="Describe the actions taken..."
                    value={formData.actionTaken}
                    onChange={e => setFormData({ ...formData, actionTaken: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Photo Upload - Only for new reports */}
                {!editingReport && (
                  <div className="space-y-2">
                    <Label>Photo (Optional)</Label>
                    <PhotoUpload maxFiles={1} maxSizeMB={10} onPhotosChange={setPhotos} />
                  </div>
                )}

                {/* Notify Parent - Only for new reports */}
                {!editingReport && (
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
                        Send an instant notification to the parent
                      </p>
                    </div>
                    <Bell className="h-5 w-5 text-warning" />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.description}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {editingReport ? 'Update Report' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports List */}
      <div className="space-y-4">
        {reportsLoading ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map(report => {
            const child = children.find(c => c.id === report.child_id);
            const typeInfo = incidentTypes.find(t => t.value === report.incident_type);
            const hasPhoto = report.wellbeing_media_url && report.wellbeing_media_url.trim().length > 0;

            return (
              <Card
                key={report.id}
                className={cn(
                  'shadow-card',
                  report.severity === 'high'
                    ? 'bg-destructive/5 border-destructive/20'
                    : report.severity === 'medium'
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-muted/50'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {typeInfo && <typeInfo.icon className={cn('h-4 w-4', typeInfo.color)} />}
                        <span className="font-semibold">
                          {child ? getFullName(child.first_name, child.last_name) : 'Unknown'}
                        </span>
                        <Badge
                          className={cn(
                            report.severity === 'high'
                              ? 'bg-destructive'
                              : report.severity === 'medium'
                              ? 'bg-warning'
                              : 'bg-success'
                          )}
                        >
                          {report.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {report.incident_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(report.report_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-foreground mb-2">{report.description}</p>
                      {report.action_taken && (
                        <div className="bg-background rounded-lg p-3 mb-3">
                          <p className="text-sm">
                            <strong>Action taken:</strong> {report.action_taken}
                          </p>
                        </div>
                      )}

                      {/* Photo */}
                      {hasPhoto && (
                        <div className="mt-4">
                          <div className="relative rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={report.wellbeing_media_url} 
                              alt="Wellbeing report"
                              className="w-full max-h-96 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {report.parent_notified && (
                        <Badge className="bg-success/60">
                          <Bell className="h-3 w-3 mr-1" />
                          Parent acknowledged
                        </Badge>
                      )}
                      {hasPhoto && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = report.wellbeing_media_url!;
                            link.download = `report-${report.report_date}.jpg`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeletingReport(report)}>
                        <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingReport} onOpenChange={(open) => !open && setDeletingReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wellbeing Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default WellbeingReportsPage;