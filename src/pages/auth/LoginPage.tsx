import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Baby, Eye, EyeOff, Loader2, School } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [isAuthenticated, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      // Role-based redirect happens via useEffect after auth state updates
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex">
      <div className=" absolute top-8 left-24 flex items-center gap-3 x-20">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow border-2 border-slate-600">
          <School className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <img className="text-foreground" src=".\logo.PNG" alt="ComPo" width="10%" height="auto" />
          <p className="text-sm text-muted-foreground">Daycare Communication Portal</p>
        </div>
      </div>
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          

          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
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
                className="h-12 input-focus border-2 border-black/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 input-focus border-2 border-black/30"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold btn-bounce"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/setup" className="text-primary hover:underline font-medium">
              Set up your daycare
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary to-[hsl(180_60%_45%)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 flex">
          <div className="absolute top-20 left-20 w-64 h-64 bg-pink-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
          <img src="loginbg.png" alt="" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-12">
          <div className="w-20 h-20 rounded-3xl bg-white/30 backdrop-blur flex items-center justify-center mb-8">
            <School className="h-12 w-12 text-white" />
            {/* <img src="./icon.png" alt="school logo" /> */}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Connecting Families & Teachers
          </h2>
          <p className="text-white font-semibold text-lg max-w-md">
            Real-time communication, activity tracking, and peace of mind for parents and educators.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
