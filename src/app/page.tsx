import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600">BlogApp</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          A place to share your thoughts and ideas with the world. Built with Next.js, Clerk, and Supabase.
        </p>
        <div className="mt-10 flex justify-center space-x-6">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition duration-200 shadow-sm"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
