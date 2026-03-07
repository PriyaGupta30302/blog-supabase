'use client';

import { UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header className="bg-card border-b border-card-border sticky top-0 z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
              BlogApp
            </Link>
          </div>
          
          <nav className="flex items-center space-x-6">
            <SignedIn>
              {isLoaded && isAdmin && (
                <Link href="/dashboard" className="text-foreground/80 hover:text-primary font-medium text-sm transition-colors">
                  Dashboard
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              {/* Auth buttons hidden from public view as per user request */}
            </SignedOut>
            
            {isAdmin && (
              <div className="border-l border-gray-100 dark:border-gray-700 h-6 mx-2" />
            )}
            <ThemeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
