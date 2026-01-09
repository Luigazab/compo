import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityCard } from '@/components/ui/activity-card';
import { useChildren } from '@/hooks/useChildren';
import { useActivityLogs, useCreateActivityLog, useAddActivityMedia } from '@/hooks/useActivityLogs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Calendar,
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
} from 'lucide-react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { cn, getFullName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: activityLogs = [], isLoading: logsLoading } = useActivityLogs();
  const createActivityLog = useCreateActivityLog();
  const addActivityMedia = useAddActivityMedia();
  
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedChild || !user) return;
    
    setIsSubmitting(true);
    try {
      // Create activity log first
      const log = await createActivityLog.mutateAsync({
        child_id: selectedChild,
        created_by: user.id,
        arrival_time: formData.arrivalTime || null,
        pickup_time: formData.pickupTime || null,
        activities: formData.activities || null,
        nap_duration: formData.napDuration || null,
        bathroom_notes: formData.bathroomNotes || null,
        general_notes: formData.generalNotes || null,
        mood: selectedMood,
      });
      
      // Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          await addActivityMedia.mutateAsync({
            activityLogId: log.id,
            file: photo,
          });
        }
      }
      
      toast({
        title: isDraft ? 'Draft saved!' : 'Activity log published!',
        description: isDraft
          ? 'Your activity log has been saved as draft.'
          : 'Parents have been notified about the activity.',
      });
      
      setShowForm(false);
      setSelectedChild('');
      setPhotos([]);
      setFormData({
        arrivalTime: '',
        pickupTime: '',
        activities: '',
        napDuration: '',
        bathroomNotes: '',
        generalNotes: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save activity log.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  // Transform activity logs for ActivityCard component
  const transformedLogs = activityLogs.map(log => {
    const child = children.find(c => c.id === log.child_id);
    return {
      id: log.id,
      childId: log.child_id,
      date: log.log_date,
      arrivalTime: log.arrival_time || undefined,
      pickupTime: log.pickup_time || undefined,
      activities: log.activities || '',
      mood: log.mood || 'happy',
      napDuration: log.nap_duration || undefined,
      notes: log.general_notes || '',
      childName: child ? getFullName(child.first_name, child.last_name) : undefined,
    };
  });

  return (
    <DashboardLayout>
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

      {/* New Activity Form */}
      {showForm && (
        <Card className="mb-6 shadow-card border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>New Activity Log</span>
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                Today
              </Badge>
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
                      onChange={e =>
                        setFormData({ ...formData, arrivalTime: e.target.value })
                      }
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
                      onChange={e =>
                        setFormData({ ...formData, pickupTime: e.target.value })
                      }
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
                    onChange={e =>
                      setFormData({ ...formData, activities: e.target.value })
                    }
                    rows={4}
                    className="resize-none"
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
                          className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
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
                          'flex items-center gap-2 px-4 py-2 rounded-xl transition-all btn-bounce',
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

                {/* Nap Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Nap Duration
                    </Label>
                    <Select
                      value={formData.napDuration}
                      onValueChange={val =>
                        setFormData({ ...formData, napDuration: val })
                      }
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
                      onChange={e =>
                        setFormData({ ...formData, bathroomNotes: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                </div>

                {/* General Notes */}
                <div className="space-y-2">
                  <Label>General Notes</Label>
                  <Textarea
                    placeholder="Any additional observations or notes..."
                    value={formData.generalNotes}
                    onChange={e =>
                      setFormData({ ...formData, generalNotes: e.target.value })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <PhotoUpload
                    maxFiles={5}
                    maxSizeMB={10}
                    onPhotosChange={setPhotos}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    className="flex-1 gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save as Draft
                  </Button>
                  <Button onClick={() => handleSubmit(false)} className="flex-1 gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publish
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past Logs */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transformedLogs.length > 0 ? (
            <div className="space-y-4">
              {transformedLogs.map(log => (
                <ActivityCard key={log.id} activity={log} showChildName />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No activity logs yet</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ActivityLogsPage;
