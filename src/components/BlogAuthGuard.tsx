'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface BlogAuthGuardProps {
  children: React.ReactNode;
  blogTitle: string;
}

export default function BlogAuthGuard({ children, blogTitle }: BlogAuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect unauthenticated users to sign-in page with return URL
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/sign-in?redirect_url=${redirectUrl}`);
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  // While Clerk is loading auth state
  if (!isLoaded) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm font-medium text-foreground/60">Verifying access...</p>
      </div>
    );
  }

  // If not signed in, show a sleek login prompt while redirecting
  if (!isSignedIn) {
    const redirectUrl = encodeURIComponent(pathname);
    return (
      <div className="my-12 p-8 md:p-12 bg-card rounded-3xl border border-card-border shadow-2xl text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
          🔒
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Sign in to read full story
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mx-auto">
            &ldquo;{blogTitle}&rdquo; is private to the BlogApp community. Please sign in or create a free account to continue reading.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/sign-in?redirect_url=${redirectUrl}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary-hover active:scale-95 transition-all"
          >
            Sign In to Continue
          </Link>
          <Link
            href={`/sign-up?redirect_url=${redirectUrl}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-muted hover:bg-card-border text-foreground font-bold rounded-xl active:scale-95 transition-all border border-card-border"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the blog content & comments
  return <>{children}</>;
}
