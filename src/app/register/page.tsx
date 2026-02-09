// src/app/register/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';

// Inner component that uses useSearchParams
function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    console.log('Token from URL:', tokenParam);
    
    if (!tokenParam) {
      setError('Access Restricted: Registration is by invitation only.');
      setValidating(false);
      return;
    }
    
    setToken(tokenParam);
    validateToken(tokenParam);
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      console.log('Validating token:', token.substring(0, 20) + '...');
      const res = await fetch(`/api/auth/validate-token?token=${token}`);
      const data = await res.json();
      
      console.log('Validation response:', data);
      
      if (data.valid && data.invitation) {
        setInvitation(data.invitation);
        setName(data.invitation.name || '');
        setEmail(data.invitation.email);
        setError('');
      } else {
        setError(data.error || 'Invalid or expired invitation link.');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate invitation. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          token,
          userType: invitation?.user_type,
          location: invitation?.location,
          phone: invitation?.phone
        }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1200);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
        <Card className="w-full max-w-md shadow-xl border-0 bg-black/90 backdrop-blur-md">
          <CardContent className="pt-12 pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-center">Validating your invitation...</p>
              <p className="text-center text-sm text-muted-foreground">
                Please wait while we verify your registration link
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
        <Card className="w-full max-w-md shadow-xl border-0 bg-black/90 backdrop-blur-md">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-headline text-center">Access Restricted</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  TalantaTrack registration is by invitation only. You need a valid invitation link to create an account.
                </p>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/join">Request Free Trial Invitation</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Back to Homepage</Link>
                </Button>
              </div>
              
              <div className="text-center text-xs text-muted-foreground mt-4">
                <p>Already have an account?</p>
                <Link href="/login" className="text-primary hover:underline">
                  Log in here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background overflow-hidden">
      <Card className="w-full max-w-md shadow-xl border-0 relative z-10 bg-black/90 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <Logo className="h-16 w-16 mb-2 text-primary" />
          
          {invitation && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Invitation Verified</span>
            </div>
          )}
          
          <CardTitle className="text-2xl font-headline text-center">
            Complete Your Registration
          </CardTitle>
          
          <CardDescription className="text-center">
            {invitation ? (
              <div className="space-y-1">
                <p>You're joining as a <span className="font-semibold text-primary">{invitation.user_type}</span></p>
                <p className="text-xs">Your 14-day free trial will start immediately</p>
              </div>
            ) : (
              'Fill in your details to create your account'
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {invitation && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Invitation Details</p>
                  <p className="text-xs text-muted-foreground">
                    You're registering as a <strong>{invitation.user_type}</strong>
                    {invitation.location && ` from ${invitation.location}`}. 
                    Your invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your full name"
                disabled={loading}
              />
              {invitation?.name && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pre-filled from your invitation
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={loading || !!invitation}
                className={invitation ? "bg-muted" : ""}
              />
              {invitation && (
                <p className="text-xs text-muted-foreground mt-1">
                  This email is from your invitation and cannot be changed
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password *</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Complete Registration & Start Free Trial'
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Already have an account?</p>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in to your account
              </Link>
            </div>
            
            {!invitation && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Need an invitation?{' '}
                  <Link href="/join" className="text-primary hover:underline">
                    Request a free trial
                  </Link>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center z-10">
        <span className="text-lg font-headline text-primary font-semibold tracking-wide">
          {invitation ? 'Welcome to TalantaTrack!' : 'Join the TalantaTrack Community!'}
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          Powered by TalantaTrack Academy
        </span>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
      <Card className="w-full max-w-md shadow-xl border-0 bg-black/90 backdrop-blur-md">
        <CardContent className="pt-12 pb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-center">Loading registration form...</p>
            <p className="text-center text-sm text-muted-foreground">
              Please wait while we prepare your registration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterForm />
    </Suspense>
  );
}