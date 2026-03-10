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
  
  // Forgot Password flow states
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetStep, setResetStep] = React.useState<'email' | 'code'>('email');
  const [resetCode, setResetCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  
  const router = useRouter();

  // Handle forgot password flow toggle
  const toggleResetMode = (val: boolean) => {
    setIsResetting(val);
    setError('');
    setResetStep('email');
    setResetCode('');
    setNewPassword('');
  };

  // Handle Google Login
  const signInWithGoogle = () => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/api/auth/callback',
      redirectUrlComplete: '/admin',
    });
  };

  React.useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push('/admin');
    }
  }, [userLoaded, isSignedIn, router]);

  // Clear states on unmount or major mode switch
  React.useEffect(() => {
    return () => {
      setError('');
      setLoading(false);
    };
  }, [isResetting]);

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
      } else if (result.status === 'needs_second_factor') {
        setError('Two-factor authentication is required for this account.');
      } else if (result.status === 'needs_new_password') {
        setError('A password reset is required for this account.');
      } else if (result.status === 'needs_first_factor' || result.status === 'needs_identifier') {
        setError(`Sign in requires identification: ${result.status}. Please check your credentials.`);
      } else {
        // Handle other statuses (e.g., MFA) or show a generic message
        console.log('SignIn result:', result);
        setError(`Sign in incomplete: ${result.status}. Please check your email or contact support.`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password flow
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (resetStep === 'email') {
        await signIn.create({
          strategy: 'reset_password_email_code',
          identifier: emailAddress,
        });
        setResetStep('code');
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: 'reset_password_email_code',
          code: resetCode,
          password: newPassword,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          router.push('/admin');
        } else {
          console.log('Reset password result:', result);
          setError('Reset password incomplete. Please check your email or contact support.');
        }
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during password reset.');
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
               {isResetting ? (
                 <>Reset <span className="text-primary">Password</span></>
               ) : (
                 <>Welcome <span className="text-primary">Back</span></>
               )}
             </h1>
             <p className="text-foreground/50 font-medium italic">
               {isResetting 
                 ? (resetStep === 'email' ? 'Enter your email to receive a code' : 'Check your inbox for the reset code')
                 : 'Sign in to continue your creative journey'}
             </p>
             <div id="clerk-captcha" className="mt-4"></div>
          </div>

          {!isResetting && (
            <div className="mb-10">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full py-4 bg-muted border border-card-border rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-card-border/20 transition-all shadow-sm group"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
                <svg className="w-4 h-4 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-card-border"></div>
                </div>
                <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-foreground/20 bg-card px-4 mx-auto w-fit">
                  Or use email
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-medium flex items-center animate-shake">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={isResetting ? handleResetPassword : handleSubmit} className="space-y-6">
            {!isResetting ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                    placeholder="you@example.com"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-sm font-bold text-foreground/70">Password</label>
                    <button 
                      type="button"
                      onClick={() => toggleResetMode(true)}
                      className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      Forgot?
                    </button>
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
              </>
            ) : (
              <>
                {resetStep === 'email' ? (
                  <div>
                    <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                      placeholder="you@example.com"
                      autoComplete="username"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-sm font-bold text-foreground/70">Reset Code</label>
                        <span className="text-[10px] font-bold text-primary animate-pulse">Check your email</span>
                      </div>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/30 font-mono tracking-widest text-center"
                        placeholder="000000"
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20 pr-12"
                          placeholder="••••••••••••"
                          autoComplete="new-password"
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
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleResetMode(false)}
                  className="w-full text-xs font-bold text-foreground/40 hover:text-primary transition-colors text-center py-2"
                >
                  ← Back to Login
                </button>
              </>
            )}

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
                  {isResetting ? (resetStep === 'email' ? 'Sending Code...' : 'Resetting...') : 'Logging In...'}
                </span>
              ) : (
                isResetting ? (resetStep === 'email' ? 'Send Reset Code' : 'Reset Password') : 'Log In'
              )}
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
