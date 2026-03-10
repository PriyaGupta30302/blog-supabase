'use client';

import * as React from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push('/admin');
    }
  }, [userLoaded, isSignedIn, router]);

  if (!isLoaded || !userLoaded) {
    return null;
  }

  // Handle submission of basic signin form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/admin');
      } else {
        // Handle other statuses (e.g., MFA) or show a generic message
        console.log('SignIn result:', result);
        setError('Sign in requires additional steps or is incomplete.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl p-10 border border-card-border transition-all animate-in fade-in zoom-in duration-500">
          <div className="mb-10 text-center">
             <h1 className="text-4xl font-black text-foreground tracking-tight mb-2 text-center">
               Welcome <span className="text-primary">Back</span>
             </h1>
             <p className="text-foreground/50 font-medium italic">
               Sign in to continue your creative journey
             </p>
             <div id="clerk-captcha" className="mt-4"></div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-medium flex items-center animate-shake">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-bold text-foreground/70">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20 pr-12"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-primary transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.222 0 2.391.269 3.44.75m4.778 3.393A10.01 10.01 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7-1.053 0-2.062-.18-3-.512m14.062-12.062l-14.062 14.062M9 9a3 3 0 005.142 2.142M12 9v2.142" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </span>
              ) : 'Log In'}
            </button>
            <div className="text-center mt-8 pt-6 border-t border-card-border">
              <span className="text-foreground/40 text-sm font-medium">Don't have an account? </span>
              <a href="/sign-up" className="text-primary hover:text-primary-hover hover:underline text-sm font-bold transition-colors">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
