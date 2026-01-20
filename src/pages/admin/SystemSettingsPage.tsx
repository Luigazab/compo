import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  useSchoolSettings, 
  useUpsertSchoolSettings, 
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
  useNotificationSettings,
  useUpdateNotificationSetting
} from '@/hooks/useSchoolSettings';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Clock, 
  Calendar, 
  Bell, 
  Shield, 
  Database,
  Save,
  Upload,
  Download,
  Mail,
  Smartphone,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const SystemSettingsPage = () => {
  const { toast } = useToast();
  
  // Fetch data
  const { data: schoolSettings, isLoading: loadingSettings } = useSchoolSettings();
  const { data: holidays = [], isLoading: loadingHolidays } = useHolidays();
  const { data: notificationSettings = [], isLoading: loadingNotifications } = useNotificationSettings();
  
  // Mutations
  const upsertSettings = useUpsertSchoolSettings();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const updateNotificationSetting = useUpdateNotificationSetting();

  // Local state for form
  const [daycareInfo, setDaycareInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    timezone: 'America/New_York',
    date_format: 'MM/DD/YYYY',
    language: 'en',
  });

  const [operatingHours, setOperatingHours] = useState({
    open_time: '07:00',
    close_time: '18:00',
    work_days: ['mon', 'tue', 'wed', 'thu', 'fri'] as string[],
  });

  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

  // Sync with fetched data
  useEffect(() => {
    if (schoolSettings) {
      setDaycareInfo({
        name: schoolSettings.name || '',
        address: schoolSettings.address || '',
        phone: schoolSettings.phone || '',
        email: schoolSettings.email || '',
        website: schoolSettings.website || '',
        description: schoolSettings.description || '',
        timezone: schoolSettings.timezone || 'America/New_York',
        date_format: schoolSettings.date_format || 'MM/DD/YYYY',
        language: schoolSettings.language || 'en',
      });
      setOperatingHours({
        open_time: schoolSettings.open_time?.substring(0, 5) || '07:00',
        close_time: schoolSettings.close_time?.substring(0, 5) || '18:00',
        work_days: schoolSettings.work_days || ['mon', 'tue', 'wed', 'thu', 'fri'],
      });
    }
  }, [schoolSettings]);

  const handleSaveSettings = async () => {
    try {
      await upsertSettings.mutateAsync({
        name: daycareInfo.name,
        address: daycareInfo.address,
        phone: daycareInfo.phone,
        email: daycareInfo.email,
        website: daycareInfo.website,
        description: daycareInfo.description,
        timezone: daycareInfo.timezone,
        date_format: daycareInfo.date_format,
        language: daycareInfo.language,
        open_time: operatingHours.open_time,
        close_time: operatingHours.close_time,
        work_days: operatingHours.work_days,
      });
      toast({
        title: 'Settings saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both name and date for the holiday.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await createHoliday.mutateAsync(newHoliday);
      setNewHoliday({ name: '', date: '' });
      toast({
        title: 'Holiday added',
        description: `${newHoliday.name} has been added to the calendar.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add holiday.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveHoliday = async (id: string) => {
    try {
      await deleteHoliday.mutateAsync(id);
      toast({
        title: 'Holiday removed',
        description: 'The holiday has been removed from the calendar.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove holiday.',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      await updateNotificationSetting.mutateAsync({ key, value });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification setting.',
        variant: 'destructive',
      });
    }
  };

  const getNotificationValue = (key: string) => {
    const setting = notificationSettings.find(s => s.setting_key === key);
    return setting?.setting_value ?? true;
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const isLoading = loadingSettings || loadingHolidays || loadingNotifications;

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
        title="System Settings"
        description="Configure your daycare portal settings"
        actions={
          <Button onClick={handleSaveSettings} disabled={upsertSettings.isPending}>
            {upsertSettings.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Daycare Information
              </CardTitle>
              <CardDescription>
                Basic information about your daycare center
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Daycare Name</Label>
                  <Input 
                    id="name" 
                    value={daycareInfo.name}
                    onChange={(e) => setDaycareInfo({...daycareInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={daycareInfo.phone}
                    onChange={(e) => setDaycareInfo({...daycareInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={daycareInfo.email}
                    onChange={(e) => setDaycareInfo({...daycareInfo, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={daycareInfo.website}
                    onChange={(e) => setDaycareInfo({...daycareInfo, website: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    value={daycareInfo.address}
                    onChange={(e) => setDaycareInfo({...daycareInfo, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={daycareInfo.timezone} 
                      onValueChange={(v) => setDaycareInfo({...daycareInfo, timezone: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                        <SelectItem value="Asia/Manila">Philippine Time (PHT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={daycareInfo.date_format} 
                      onValueChange={(v) => setDaycareInfo({...daycareInfo, date_format: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={daycareInfo.language} 
                      onValueChange={(v) => setDaycareInfo({...daycareInfo, language: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="tl">Filipino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Logo & Branding</h3>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended size: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operating Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Operating Hours
              </CardTitle>
              <CardDescription>
                Set your daycare's regular operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opening Time</Label>
                    <Input 
                      type="time" 
                      value={operatingHours.open_time}
                      onChange={(e) => setOperatingHours({...operatingHours, open_time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Closing Time</Label>
                    <Input 
                      type="time" 
                      value={operatingHours.close_time}
                      onChange={(e) => setOperatingHours({...operatingHours, close_time: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Operating Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = operatingHours.work_days.includes(day)
                            ? operatingHours.work_days.filter(d => d !== day)
                            : [...operatingHours.work_days, day];
                          setOperatingHours({...operatingHours, work_days: newDays});
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          operatingHours.work_days.includes(day)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holidays */}
        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Holiday Calendar
              </CardTitle>
              <CardDescription>
                Manage holidays when the daycare will be closed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    type="date" 
                    className="w-48" 
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  />
                  <Input 
                    placeholder="Holiday name" 
                    className="flex-1" 
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  />
                  <Button onClick={handleAddHoliday} disabled={createHoliday.isPending}>
                    {createHoliday.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Holiday'}
                  </Button>
                </div>
                <div className="space-y-2 pt-4">
                  {holidays.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No holidays configured yet.</p>
                  ) : (
                    holidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{holiday.name}</span>
                          <Badge variant="outline">{format(new Date(holiday.date), 'MMM d, yyyy')}</Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleRemoveHoliday(holiday.id)}
                          disabled={deleteHoliday.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how notifications are sent to parents and staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Notifications
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Activity Summary</Label>
                      <p className="text-sm text-muted-foreground">Send parents a daily summary of their child's activities</p>
                    </div>
                    <Switch 
                      checked={getNotificationValue('email_daily_summary')}
                      onCheckedChange={(checked) => handleNotificationToggle('email_daily_summary', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Wellbeing Alerts</Label>
                      <p className="text-sm text-muted-foreground">Immediately notify parents of wellbeing incidents</p>
                    </div>
                    <Switch 
                      checked={getNotificationValue('email_wellbeing_alerts')}
                      onCheckedChange={(checked) => handleNotificationToggle('email_wellbeing_alerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Announcement Emails</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications for new announcements</p>
                    </div>
                    <Switch 
                      checked={getNotificationValue('email_announcements')}
                      onCheckedChange={(checked) => handleNotificationToggle('email_announcements', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Document Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send reminders for pending document submissions</p>
                    </div>
                    <Switch 
                      checked={getNotificationValue('email_document_reminders')}
                      onCheckedChange={(checked) => handleNotificationToggle('email_document_reminders', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Push Notifications
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Messages</Label>
                      <p className="text-sm text-muted-foreground">Notify users of new messages</p>
                    </div>
                    <Switch 
                      checked={getNotificationValue('push_new_messages')}
                      onCheckedChange={(checked) => handleNotificationToggle('push_new_messages', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Photo Uploads</Label>
                      <p className="text-sm text-muted-foreground">Notify parents when new photos are uploaded</p>
                    </div>
                    <Switch 
                      checked={getNotificationValue('push_photo_uploads')}
                      onCheckedChange={(checked) => handleNotificationToggle('push_photo_uploads', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup & Data
              </CardTitle>
              <CardDescription>
                Export and manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Download className="h-6 w-6" />
                  <span>Export All Data</span>
                  <span className="text-xs text-muted-foreground">Download complete backup</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Database className="h-6 w-6" />
                  <span>Export Student Records</span>
                  <span className="text-xs text-muted-foreground">Student data only</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Data exports are generated as CSV files that can be opened in Excel or imported into other systems.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;
