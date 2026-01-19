import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { useActivityLogs, useCreateActivityLog, useUpdateActivityLog } from '@/hooks/useActivityLogs';
import { useCreateNotification } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Save,
  Send,
  Smile,
  Frown,
  Zap,
  Battery,
  Heart,
  Moon,
  Loader2,
  Edit,
  Trash2,
  X,
  Download,
  Search,
  Filter,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { cn, getFullName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const moods = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'bg-mood-happy' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'bg-mood-sad' },
  { value: 'energetic', label: 'Energetic', icon: Zap, color: 'bg-mood-energetic' },
  { value: 'tired', label: 'Tired', icon: Battery, color: 'bg-mood-tired' },
  { value: 'calm', label: 'Calm', icon: Heart, color: 'bg-mood-calm' },
];

const ActivityLogsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get teacher's classrooms and children
  const { data: teacherAssignments = [] } = useTeacherClassrooms(user?.id);
  const allClassroomIds = useMemo(() => teacherAssignments.map(a => a.classroom.id), [teacherAssignments]);
  const { data: children = [], isLoading: childrenLoading } = useChildrenByClassrooms(allClassroomIds);
  const { data: activityLogs = [], isLoading: logsLoading } = useActivityLogs();
  
  const createActivityLog = useCreateActivityLog();
  const updateActivityLog = useUpdateActivityLog();
  const createNotification = useCreateNotification();
  
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [deletingLog, setDeletingLog] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    arrivalTime: '',
    pickupTime: '',
    activities: '',
    napDuration: '',
    bathroomNotes: '',
    generalNotes: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  // Filter logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      // Only show logs for teacher's students
      if (!children.some(c => c.id === log.child_id)) return false;

      // Child filter
      const matchesChild = selectedChildFilter === 'all' || log.child_id === selectedChildFilter;
      
      // Date filter
      const logDate = parseISO(log.log_date);
      const matchesDate = dateRange.from && dateRange.to 
        ? isWithinInterval(logDate, { start: dateRange.from, end: dateRange.to })
        : true;
      
      // Search filter
      const child = children.find(c => c.id === log.child_id);
      const childName = child ? `${child.first_name} ${child.last_name}`.toLowerCase() : '';
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        childName.includes(searchLower) ||
        log.activities?.toLowerCase().includes(searchLower) ||
        log.general_notes?.toLowerCase().includes(searchLower);
      
      return matchesChild && matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  }, [activityLogs, children, selectedChildFilter, dateRange, searchQuery]);

  const resetForm = () => {
    setShowForm(false);
    setEditingLog(null);
    setSelectedChild('');
    setSelectedMood('happy');
    setPhotos([]);
    setFormData({
      arrivalTime: '',
      pickupTime: '',
      activities: '',
      napDuration: '',
      bathroomNotes: '',
      generalNotes: '',
    });
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setSelectedChild(log.child_id);
    setSelectedMood(log.mood || 'happy');
    setFormData({
      arrivalTime: log.arrival_time || '',
      pickupTime: log.pickup_time || '',
      activities: log.activities || '',
      napDuration: log.nap_duration || '',
      bathroomNotes: log.bathroom_notes || '',
      generalNotes: log.general_notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingLog) return;

    try {
      const { error } = await supabase
        .from('daily_activity_logs')
        .delete()
        .eq('id', deletingLog.id);

      if (error) throw error;

      toast({
        title: 'Activity log deleted',
        description: 'The activity log has been removed.',
      });
      setDeletingLog(null);
      window.location.reload(); // Refresh to update the list
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete activity log.',
        variant: 'destructive',
      });
    }
  };

  const notifyParents = async (childId: string, activityDate: string) => {
    try {
      // Get parents for this child
      const { data: parentLinks, error: parentError } = await supabase
        .from('child_parent')
        .select('parent_id')
        .eq('child_id', childId);

      if (parentError) throw parentError;

      const child = children.find(c => c.id === childId);
      const childName = child ? `${child.first_name} ${child.last_name}` : 'your child';

      // Create notification for each parent
      for (const link of parentLinks || []) {
        await createNotification.mutateAsync({
          user_id: link.parent_id,
          title: 'New Activity Log',
          message: `A new activity has been logged for ${childName} on ${format(parseISO(activityDate), 'MMM d, yyyy')}.`,
          type: 'info',
          link: '/parent/activity-feed',
        });
      }
    } catch (error) {
      console.error('Error notifying parents:', error);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedChild || !user) return;
    
    setIsSubmitting(true);
    try {
      const photo = photos.length > 0 ? photos[0] : undefined;
      const logDate = new Date().toISOString().split('T')[0];

      if (editingLog) {
        // Update existing log
        await updateActivityLog.mutateAsync({
          id: editingLog.id,
          arrival_time: formData.arrivalTime || null,
          pickup_time: formData.pickupTime || null,
          activities: formData.activities || null,
          nap_duration: formData.napDuration || null,
          bathroom_notes: formData.bathroomNotes || null,
          general_notes: formData.generalNotes || null,
          mood: selectedMood,
        });

        toast({
          title: 'Activity log updated!',
          description: 'The activity log has been updated successfully.',
        });
      } else {
        // Create new log
        await createActivityLog.mutateAsync({
          log: {
            child_id: selectedChild,
            created_by: user.id,
            log_date: logDate,
            arrival_time: formData.arrivalTime || null,
            pickup_time: formData.pickupTime || null,
            activities: formData.activities || null,
            nap_duration: formData.napDuration || null,
            bathroom_notes: formData.bathroomNotes || null,
            general_notes: formData.generalNotes || null,
            mood: selectedMood,
          },
          photo,
        });

        // Notify parents
        if (!isDraft) {
          await notifyParents(selectedChild, logDate);
        }

        toast({
          title: isDraft ? 'Draft saved!' : 'Activity log published!',
          description: isDraft
            ? 'Your activity log has been saved as draft.'
            : 'Parents have been notified about the activity.',
        });
      }
      
      resetForm();
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      console.error('Error saving activity log:', error);
      toast({
        title: 'Error',
        description: 'Failed to save activity log. Please try again.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const getMoodIcon = (mood: string | null) => {
    const moodData = moods.find(m => m.value === mood) || moods[0];
    const Icon = moodData.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getInitials = (firstName: string, lastName: string) => 
    `${firstName[0]}${lastName[0]}`.toUpperCase();

  const clearFilters = () => {
    setSelectedChildFilter('all');
    setSearchQuery('');
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date()
    });
  };

  const hasActiveFilters = selectedChildFilter !== 'all' || searchQuery.length > 0;

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
        <PageHeader
          title="Daily Activity Logs"
          description="Record and track daily activities for each child"
          actions={
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Log
            </Button>
          }
        />

        {/* Filters */}
        <Card className="shadow-card mt-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student name or activity..."
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

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange.from && dateRange.to 
                        ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                        : 'Select dates'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New/Edit Activity Form */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLog ? 'Edit Activity Log' : 'New Activity Log'}</DialogTitle>
            <DialogDescription>
              {editingLog ? 'Update the activity details below' : 'Record daily activities for a student'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Child Selection */}
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild} disabled={!!editingLog}>
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
                {/* Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Arrival Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.arrivalTime}
                      onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Pickup Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.pickupTime}
                      onChange={e => setFormData({ ...formData, pickupTime: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Activities */}
                <div className="space-y-2">
                  <Label>Activities</Label>
                  <Textarea
                    placeholder="Describe the child's activities today..."
                    value={formData.activities}
                    onChange={e => setFormData({ ...formData, activities: e.target.value })}
                    rows={4}
                  />
                  <div className="flex flex-wrap gap-2">
                    {['Circle time', 'Arts & crafts', 'Outdoor play', 'Story time', 'Music', 'Sensory play'].map(
                      activity => (
                        <button
                          key={activity}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              activities: formData.activities
                                ? `${formData.activities}, ${activity}`
                                : activity,
                            })
                          }
                          className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full"
                        >
                          + {activity}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Mood */}
                <div className="space-y-2">
                  <Label>Overall Mood</Label>
                  <div className="flex gap-2 flex-wrap">
                    {moods.map(mood => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setSelectedMood(mood.value)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                          selectedMood === mood.value
                            ? `${mood.color} text-white shadow-lg`
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        <mood.icon className="h-4 w-4" />
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nap & Bathroom */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Nap Duration
                    </Label>
                    <Select
                      value={formData.napDuration}
                      onValueChange={val => setFormData({ ...formData, napDuration: val })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No nap</SelectItem>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="2+ hours">2+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bathroom Notes</Label>
                    <Input
                      placeholder="Any notes..."
                      value={formData.bathroomNotes}
                      onChange={e => setFormData({ ...formData, bathroomNotes: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* General Notes */}
                <div className="space-y-2">
                  <Label>General Notes</Label>
                  <Textarea
                    placeholder="Any additional observations..."
                    value={formData.generalNotes}
                    onChange={e => setFormData({ ...formData, generalNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Photo Upload - Only show for new logs */}
                {!editingLog && (
                  <div className="space-y-2">
                    <Label>Photo (optional)</Label>
                    <PhotoUpload maxFiles={1} maxSizeMB={10} onPhotosChange={setPhotos} />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            {editingLog ? (
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Update
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Publish
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Logs List */}
      <div className="space-y-4">
        {logsLoading ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading activities...</p>
            </CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No activity logs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map(log => {
            const child = children.find(c => c.id === log.child_id);
            const hasPhoto = log.activity_media_url && log.activity_media_url.trim().length > 0;

            return (
              <Card key={log.id} className="shadow-card">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {child ? getInitials(child.first_name, child.last_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {child ? `${child.first_name} ${child.last_name}` : 'Unknown'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(log.log_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-muted rounded-xl">
                        {getMoodIcon(log.mood)}
                      </div>
                      <span className="text-sm font-medium capitalize">{log.mood || 'Happy'}</span>
                    </div>
                  </div>

                  {/* Time & Nap Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {(log.arrival_time || log.pickup_time) && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {log.arrival_time || 'Not recorded'} - {log.pickup_time || 'Present'}
                      </span>
                    )}
                    {log.nap_duration && (
                      <span className="flex items-center gap-1">
                        <Moon className="h-4 w-4" />
                        Nap: {log.nap_duration}
                      </span>
                    )}
                  </div>

                  {/* Activities */}
                  {log.activities && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-1">Activities</h4>
                      <p className="text-foreground">{log.activities}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {log.general_notes && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm italic">"{log.general_notes}"</p>
                    </div>
                  )}

                  {/* Bathroom Notes */}
                  {log.bathroom_notes && (
                    <div className="text-sm text-muted-foreground mb-4">
                      <span className="font-medium">Bathroom: </span>
                      {log.bathroom_notes}
                    </div>
                  )}

                  {/* Photo */}
                  {hasPhoto && (
                    <div className="mb-4">
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={log.activity_media_url} 
                          alt="Activity"
                          className="w-full max-h-96 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {log.is_acknowledged && (
                        <Badge variant="secondary" className="gap-1">
                          <Heart className="h-3 w-3" />
                          Acknowledged by parent
                        </Badge>
                      )}
                      {hasPhoto && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = log.activity_media_url;
                            link.download = `activity-${log.log_date}.jpg`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(log)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeletingLog(log)}>
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
      <AlertDialog open={!!deletingLog} onOpenChange={(open) => !open && setDeletingLog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity Log?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity log. This action cannot be undone.
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

export default ActivityLogsPage;