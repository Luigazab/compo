import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Mail,
  Smartphone,
  Globe
} from 'lucide-react';

const SystemSettingsPage = () => {
  const [daycareInfo, setDaycareInfo] = useState({
    name: 'LittleSteps Daycare',
    address: '123 Sunshine Lane, Happy Valley, CA 90210',
    phone: '+1 (555) 123-4567',
    email: 'contact@littlesteps.com',
    website: 'www.littlesteps.com',
  });

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '07:00', close: '18:00', isOpen: true },
    tuesday: { open: '07:00', close: '18:00', isOpen: true },
    wednesday: { open: '07:00', close: '18:00', isOpen: true },
    thursday: { open: '07:00', close: '18:00', isOpen: true },
    friday: { open: '07:00', close: '18:00', isOpen: true },
    saturday: { open: '08:00', close: '14:00', isOpen: false },
    sunday: { open: '08:00', close: '14:00', isOpen: false },
  });

  const holidays = [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-07-04', name: 'Independence Day' },
    { date: '2024-11-28', name: 'Thanksgiving' },
    { date: '2024-12-25', name: 'Christmas Day' },
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <DashboardLayout>
      <PageHeader
        title="System Settings"
        description="Configure your daycare portal settings"
        actions={
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                    <Select defaultValue="pst">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
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
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="w-28">
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    <Switch 
                      checked={operatingHours[day as keyof typeof operatingHours].isOpen}
                      onCheckedChange={(checked) => 
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...operatingHours[day as keyof typeof operatingHours], isOpen: checked }
                        })
                      }
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Input 
                        type="time" 
                        value={operatingHours[day as keyof typeof operatingHours].open}
                        disabled={!operatingHours[day as keyof typeof operatingHours].isOpen}
                        className="w-32"
                        onChange={(e) => 
                          setOperatingHours({
                            ...operatingHours,
                            [day]: { ...operatingHours[day as keyof typeof operatingHours], open: e.target.value }
                          })
                        }
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input 
                        type="time" 
                        value={operatingHours[day as keyof typeof operatingHours].close}
                        disabled={!operatingHours[day as keyof typeof operatingHours].isOpen}
                        className="w-32"
                        onChange={(e) => 
                          setOperatingHours({
                            ...operatingHours,
                            [day]: { ...operatingHours[day as keyof typeof operatingHours], close: e.target.value }
                          })
                        }
                      />
                    </div>
                    <Badge variant={operatingHours[day as keyof typeof operatingHours].isOpen ? "default" : "secondary"}>
                      {operatingHours[day as keyof typeof operatingHours].isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                ))}
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
                  <Input type="date" className="w-48" />
                  <Input placeholder="Holiday name" className="flex-1" />
                  <Button>Add Holiday</Button>
                </div>
                <div className="space-y-2 pt-4">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{holiday.name}</span>
                        <Badge variant="outline">{holiday.date}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    </div>
                  ))}
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
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Wellbeing Alerts</Label>
                      <p className="text-sm text-muted-foreground">Immediately notify parents of wellbeing incidents</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Announcement Emails</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications for new announcements</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Document Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send reminders for pending document submissions</p>
                    </div>
                    <Switch defaultChecked />
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
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Photo Uploads</Label>
                      <p className="text-sm text-muted-foreground">Notify parents when new photos are uploaded</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Select defaultValue="8">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Password Expiry</Label>
                    <Select defaultValue="never">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pl-4">
                  <div>
                    <Label>Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Session Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <Select defaultValue="60">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pl-4">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Legal Documents</h3>
                <div className="flex gap-4 pl-4">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Button>
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
                Backup & Data Export
              </CardTitle>
              <CardDescription>
                Manage data backups and exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Automatic Backups</h3>
                <div className="flex items-center justify-between pl-4">
                  <div>
                    <Label>Enable Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="pl-4 space-y-2">
                  <Label>Backup Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Manual Backup</h3>
                <div className="flex gap-4 pl-4">
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Create Backup Now
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground pl-4">
                  Last backup: December 29, 2024 at 3:00 AM
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Data Export</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Students (CSV)
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Activity Logs
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Meal Records
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;
