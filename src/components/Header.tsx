import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
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
              <Link href="/dashboard" className="text-foreground/80 hover:text-primary font-medium text-sm transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-foreground/80 hover:text-primary font-medium text-sm transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-hover transition-all shadow-sm">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            
            <div className="border-l border-gray-100 dark:border-gray-700 pl-4">
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
