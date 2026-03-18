'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

// SVG decorations for flowers and sports
const FlowerDecoration = () => (
  <svg
    className="absolute left-8 top-8 w-32 h-32 opacity-30 text-pink-300 pointer-events-none"
    viewBox="0 0 100 100"
    fill="none"
  >
    <circle cx="50" cy="50" r="20" fill="currentColor" />
    <ellipse cx="50" cy="20" rx="10" ry="20" fill="currentColor" opacity="0.7" />
    <ellipse cx="50" cy="80" rx="10" ry="20" fill="currentColor" opacity="0.7" />
    <ellipse cx="20" cy="50" rx="20" ry="10" fill="currentColor" opacity="0.7" />
    <ellipse cx="80" cy="50" rx="20" ry="10" fill="currentColor" opacity="0.7" />
  </svg>
);

const FootballIcon = () => (
  <svg
    className="absolute right-12 top-24 w-20 h-20 opacity-20 text-primary pointer-events-none"
    viewBox="0 0 64 64"
    fill="none"
  >
    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" fill="white" />
    <polygon points="32,16 40,24 36,36 28,36 24,24" fill="currentColor" opacity="0.7" />
    <polygon points="32,48 40,40 36,36 28,36 24,40" fill="currentColor" opacity="0.4" />
  </svg>
);

const MedalIcon = () => (
  <svg
    className="absolute left-16 bottom-16 w-16 h-16 opacity-20 text-yellow-400 pointer-events-none"
    viewBox="0 0 64 64"
    fill="none"
  >
    <circle cx="32" cy="40" r="12" fill="currentColor" />
    <rect x="28" y="8" width="8" height="24" fill="#bfa46d" />
    <polygon points="32,8 24,24 40,24" fill="#bfa46d" />
  </svg>
);

const StarIcon = () => (
  <svg
    className="absolute right-8 bottom-8 w-14 h-14 opacity-20 text-blue-400 pointer-events-none"
    viewBox="0 0 64 64"
    fill="none"
  >
    <polygon
      points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26"
      fill="currentColor"
    />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Call your real login API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Optionally store token/session here
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background overflow-hidden">
      {/* Decorative SVGs */}
      <FlowerDecoration />
      <FootballIcon />
      <MedalIcon />
      <StarIcon />
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,192,203,0.08) 0, transparent 60%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.08) 0, transparent 60%)',
          zIndex: 0,
        }}
      />
      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl border-0 relative z-10 bg-black/90 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <Logo className="h-16 w-16 mb-2 text-primary" />
          <CardTitle className="text-2xl font-headline">Sign in to TalentTrack</CardTitle>
          <CardDescription className="text-center">
            Welcome back! Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="accent-primary" disabled={loading} />
                <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* Optional: App tagline at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center z-10">
        <span className="text-lg font-headline text-primary font-semibold tracking-wide">
          Unlock Your Talent. Achieve Greatness.
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          Powered by TalentTrack Academy
        </span>
      </div>
    </div>
  );
}
