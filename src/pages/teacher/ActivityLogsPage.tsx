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
import { mockChildren, mockClassrooms, mockActivityLogs } from '@/lib/mockData';
import {
  Plus,
  Calendar,
  Clock,
  Camera,
  Save,
  Send,
  Smile,
  Frown,
  Zap,
  Battery,
  Heart,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [formData, setFormData] = useState({
    arrivalTime: '',
    pickupTime: '',
    activities: '',
    napDuration: '',
    bathroomNotes: '',
    generalNotes: '',
  });

  const classroom = mockClassrooms[0];
  const classroomChildren = mockChildren.filter(c => c.classroomId === classroom.id);

  const handleSubmit = (isDraft: boolean) => {
    toast({
      title: isDraft ? 'Draft saved!' : 'Activity log published!',
      description: isDraft
        ? 'Your activity log has been saved as draft.'
        : 'Parents have been notified about the activity.',
    });
    setShowForm(false);
    setSelectedChild('');
    setFormData({
      arrivalTime: '',
      pickupTime: '',
      activities: '',
      napDuration: '',
      bathroomNotes: '',
      generalNotes: '',
    });
  };

  const selectedChildData = mockChildren.find(c => c.id === selectedChild);

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
                  {classroomChildren.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
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
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop photos or click to upload
                    </p>
                    <Button variant="secondary" size="sm" className="mt-3">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button onClick={() => handleSubmit(false)} className="flex-1 gap-2">
                    <Send className="h-4 w-4" />
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
          <div className="space-y-4">
            {mockActivityLogs.map(log => (
              <ActivityCard key={log.id} activity={log} showChildName />
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ActivityLogsPage;
