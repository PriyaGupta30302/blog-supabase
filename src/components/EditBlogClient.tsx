'use client';

import Header from "@/components/Header";
import BlogForm from "@/components/BlogForm";
import { useRouter } from "next/navigation";

export default function EditBlogClient({ blog }: { blog: any }) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
           <button 
             onClick={() => router.back()}
             className="text-sm text-gray-500 hover:text-blue-600 flex items-center mb-4 transition"
           >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
           </button>
           <h1 className="text-3xl font-bold text-gray-900">Edit <span className="text-blue-600">Blog Post</span></h1>
        </div>
        
        <BlogForm initialData={blog} onSuccess={handleSuccess} />
      </main>
    </div>
  );
}
