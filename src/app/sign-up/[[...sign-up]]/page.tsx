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
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

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
        router.push('/sign-in');
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
               {pendingVerification ? 'Verify Your <span className="text-primary">Email</span>' : 'Create <span className="text-primary">Account</span>'}
             </h1>
             <p className="text-foreground/50 font-medium italic">
               {pendingVerification ? 'Check your inbox for the verification code' : 'Join our creative community today'}
             </p>
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
              <div>
                <label className="block text-sm font-bold text-foreground/70 mb-2 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-muted border border-card-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-foreground transition-all placeholder:text-foreground/20"
                  placeholder="••••••••••••"
                  required
                />
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
