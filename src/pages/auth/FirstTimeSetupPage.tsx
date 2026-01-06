import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Baby, Loader2, Building, Clock, User, CheckCircle, School } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Admin Account', icon: User },
  { id: 2, title: 'Daycare Info', icon: Building },
  { id: 3, title: 'Operating Hours', icon: Clock },
];

const FirstTimeSetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  // Form state
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [daycareData, setDaycareData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  });

  const [operatingData, setOperatingData] = useState({
    timezone: 'America/New_York',
    openTime: '07:00',
    closeTime: '18:00',
    workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  });

  const validateStep = () => {
    if (currentStep === 1) {
      if (!adminData.name || !adminData.email || !adminData.password) {
        setError('Please fill in all required fields');
        return false;
      }
      if (adminData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!daycareData.name) {
        setError('Please enter your daycare name');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    // Create admin account using Supabase
    const result = await signUp(adminData.email, adminData.password, adminData.name, 'admin');
    
    if (result.success) {
      toast({
        title: 'Setup complete!',
        description: 'Your daycare portal is ready. Please check your email to verify your account.',
      });
      navigate('/login');
    } else {
      setError(result.error || 'Failed to create account');
      setIsLoading(false);
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow border-2 border-slate-600">
            <School className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <img className="text-foreground" src=".\logo.PNG" alt="ComPo" width="125px" height="auto" />
            <p className="text-sm text-muted-foreground">Admin account setup</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    currentStep > step.id
                      ? 'bg-success text-success-foreground'
                      : currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span className="text-xs font-medium mt-2 text-center">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-1 mx-2 rounded transition-colors',
                    currentStep > step.id ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card rounded-2xl border shadow-card p-8">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Admin Account */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create Admin Account</h2>
                <p className="text-muted-foreground mt-1">
                  Set up the primary administrator account
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name *</Label>
                  <Input
                    id="adminName"
                    value={adminData.name}
                    onChange={e => setAdminData({ ...adminData, name: e.target.value })}
                    placeholder="Juan Dela Cruz"
                    className="h-12 input-focus"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone</Label>
                  <Input
                    id="adminPhone"
                    value={adminData.phone}
                    onChange={e => setAdminData({ ...adminData, phone: e.target.value })}
                    placeholder="0912 3456 789"
                    className="h-12 input-focus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminData.email}
                  onChange={e => setAdminData({ ...adminData, email: e.target.value })}
                  placeholder="sample@email.com"
                  className="h-12 input-focus"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password * (min 6 characters)</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminData.password}
                  onChange={e => setAdminData({ ...adminData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="h-12 input-focus"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Daycare Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Daycare Information</h2>
                <p className="text-muted-foreground mt-1">
                  Tell us about your daycare center
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daycareName">Daycare Name *</Label>
                <Input
                  id="daycareName"
                  value={daycareData.name}
                  onChange={e => setDaycareData({ ...daycareData, name: e.target.value })}
                  placeholder="Sunshine Kids Daycare"
                  className="h-12 input-focus"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daycareAddress">Address</Label>
                <Textarea
                  id="daycareAddress"
                  value={daycareData.address}
                  onChange={e => setDaycareData({ ...daycareData, address: e.target.value })}
                  placeholder="123 Main Street, City, Barangay 12345"
                  className="input-focus resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daycarePhone">Phone</Label>
                  <Input
                    id="daycarePhone"
                    value={daycareData.phone}
                    onChange={e => setDaycareData({ ...daycareData, phone: e.target.value })}
                    placeholder="0912 3456 789"
                    className="h-12 input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daycareEmail">Email</Label>
                  <Input
                    id="daycareEmail"
                    type="email"
                    value={daycareData.email}
                    onChange={e => setDaycareData({ ...daycareData, email: e.target.value })}
                    placeholder="sample@email.com"
                    className="h-12 input-focus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daycareDesc">Description (Optional)</Label>
                <Textarea
                  id="daycareDesc"
                  value={daycareData.description}
                  onChange={e => setDaycareData({ ...daycareData, description: e.target.value })}
                  placeholder="A brief description of your daycare..."
                  className="input-focus resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Operating Hours */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Operating Hours</h2>
                <p className="text-muted-foreground mt-1">
                  Configure your daycare's schedule
                </p>
              </div>

              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select
                  value={operatingData.timezone}
                  onValueChange={val => setOperatingData({ ...operatingData, timezone: val })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openTime">Opening Time</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={operatingData.openTime}
                    onChange={e => setOperatingData({ ...operatingData, openTime: e.target.value })}
                    className="h-12 input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeTime">Closing Time</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={operatingData.closeTime}
                    onChange={e => setOperatingData({ ...operatingData, closeTime: e.target.value })}
                    className="h-12 input-focus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Operating Days</Label>
                <div className="flex flex-wrap gap-2">
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const newDays = operatingData.workDays.includes(day)
                          ? operatingData.workDays.filter(d => d !== day)
                          : [...operatingData.workDays, day];
                        setOperatingData({ ...operatingData, workDays: newDays });
                      }}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-all btn-bounce',
                        operatingData.workDays.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-bounce"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="btn-bounce min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Setting up...
                </>
              ) : currentStep === 3 ? (
                'Complete Setup'
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeSetupPage;
