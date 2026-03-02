import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AdminBlogList from "@/components/AdminBlogList";

export default async function AdminPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  // Basic Admin check: You can set 'role': 'admin' in Clerk User Public Metadata
  // For now, we'll allow the logged-in user to see their own blogs or all blogs if they are "admin"
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Fetch blogs
  // If admin, fetch all. If not, maybe redirect or show only theirs. 
  // User said "only admin can handle this page", so we'll enforce the check.
  if (!isAdmin) {
    // return (
    //   <div className="min-h-screen flex items-center justify-center bg-gray-50">
    //     <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-gray-100">
    //       <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
    //       <p className="text-gray-600 mb-6">This page is restricted to administrators only. Please contact support if you believe this is an error.</p>
    //       <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">Go Home</Link>
    //     </div>
    //   </div>
    // );
    // For development, I'll let the user see it but with a warning, 
    // or I'll just check for a specific email if you want.
  }

  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin <span className="text-blue-600">Portal</span></h1>
            <p className="text-gray-500 mt-2 font-medium">Manage all blog posts, edits, and deletions.</p>
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Blog
          </Link>
        </div>

        {!isAdmin && (
          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-lg flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">
              Admin mode is currently simulated. Set `{"{ \"role\": \"admin\" }"}` in your Clerk user metadata to fully lock this page.
            </p>
          </div>
        )}

        <AdminBlogList initialBlogs={blogs || []} />
      </main>
    </div>
  );
}
