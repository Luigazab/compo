import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Baby, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, Circle, School } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, isAuthenticated } = useAuth();

  // Check if user came from reset email (they'll have a session)
  useEffect(() => {
    if (!isAuthenticated) {
      // User might not be authenticated if they haven't clicked the email link
      // The link contains a token that auto-logs them in
    }
  }, [isAuthenticated]);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet) {
      toast({
        title: 'Password requirements not met',
        description: 'Please ensure your password meets all requirements.',
        variant: 'destructive',
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are identical.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const result = await updatePassword(password);
    
    if (result.success) {
      toast({
        title: 'Password reset successful!',
        description: 'You can now log in with your new password.',
      });
      navigate('/login');
    } else {
      toast({
        title: 'Failed to reset password',
        description: result.error || 'Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow border-2 border-slate-600">
            <School className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <img className="text-foreground" src="/logo.PNG" alt="ComPo" width="125px" height="auto" />
            <p className="text-sm text-muted-foreground">Daycare Communication Portal</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Set new password</h2>
            <p className="text-muted-foreground mt-2">
              Your new password must be different from previous passwords.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors',
                      passwordRequirements.filter(r => r.met).length >= i
                        ? 'bg-success'
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <ul className="space-y-1">
                {passwordRequirements.map((req, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      req.met ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {req.met ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className={cn(
                  'h-12 input-focus',
                  confirmPassword && (passwordsMatch ? 'border-success' : 'border-destructive')
                )}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold btn-bounce"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
