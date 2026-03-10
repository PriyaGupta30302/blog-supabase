'use client';

import * as React from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && signUp.status === 'complete') {
      router.push('/admin');
    }
  }, [isLoaded, signUp, router]);

  if (!isLoaded) {
    return null;
  }

  // Handle submission of basic signup form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      // Send the verification email code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Change the UI to our verification form
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors[0].message);
    }
  };

  // Handle submission of verification form
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.errors[0].message);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-xl bg-card rounded-3xl shadow-2xl p-10 border border-card-border transition-all animate-in fade-in zoom-in duration-500">
          <div className="mb-10 text-center">
             <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
               {pendingVerification ? (
                 <>Verify Your <span className="text-primary">Email</span></>
               ) : (
                 <>Create <span className="text-primary">Account</span></>
               )}
             </h1>
             <p className="text-foreground/50 font-medium italic">
               {pendingVerification ? 'Check your inbox for the verification code' : 'Join our creative community today'}
             </p>
             {/* Required for Clerk Smart CAPTCHA */}
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

          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                    placeholder="Jane"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                  placeholder="jane.doe@example.com"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Password</label>
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
                className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                Sign Up
              </button>
              <div className="text-center mt-8 pt-6 border-t border-card-border">
                <span className="text-foreground/40 text-sm font-medium">Already have an account? </span>
                <a href="/sign-in" className="text-primary hover:text-primary-hover hover:underline text-sm font-bold transition-colors">Log In</a>
              </div>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground/70 mb-4 text-center">Enter Verification Code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-6 bg-muted border-2 border-card-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none text-foreground text-center text-4xl tracking-[1em] font-black transition-all placeholder:opacity-10"
                  placeholder="000000"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                Verify OTP
              </button>
              <p className="text-center text-sm text-foreground/40 font-medium mt-4">
                A verification code has been sent to your email.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
