import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
              BlogApp
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <SignedIn>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
          </nav>
        </div>
      </div>
    </header>
  );
}
