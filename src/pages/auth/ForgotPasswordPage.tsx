import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Baby, ArrowLeft, Loader2, CheckCircle, Mail } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'Failed to send reset email');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <Baby className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">LittleSteps</h1>
            <p className="text-sm text-muted-foreground">Daycare Portal</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-card p-8">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Forgot password?</h2>
                <p className="text-muted-foreground mt-2">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="h-12 input-focus"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold btn-bounce"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
              <p className="text-muted-foreground mt-2">
                We sent a password reset link to
              </p>
              <p className="font-medium text-foreground mt-1">{email}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Click to resend
                </button>
              </p>
            </div>
          )}

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

export default ForgotPasswordPage;
