'use client';

import { UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header className="bg-background/85 backdrop-blur-md border-b-2 border-ink sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0">
            <span className="grid h-9 w-9 shrink-0 -rotate-6 place-items-center border-2 border-ink bg-primary font-display text-lg font-extrabold text-primary-foreground shadow-[3px_3px_0_var(--ink)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              B
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Blog<span className="text-primary">App</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            {isLoaded && (
              <Link
                href="/admin"
                className="sticker-sm bg-primary text-primary-foreground px-3 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Dashboard
              </Link>
            )}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              {/* Auth buttons hidden from public view as per user request */}
            </SignedOut>

            {isAdmin && <div className="bg-card-border w-px h-6 mx-1" />}
            <ThemeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
