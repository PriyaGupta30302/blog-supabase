'use client';

import * as React from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  // Handle submission of basic signin form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/admin');
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors[0].message);
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
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-bold text-foreground/70">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">Forgot?</a>
              </div>
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
              Log In
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
