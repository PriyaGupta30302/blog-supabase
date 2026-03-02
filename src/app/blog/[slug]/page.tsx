import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import BlogContent from "@/components/BlogContent";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !blog) {
    notFound();
  }

  // Sanitize the HTML content for safe rendering
  const sanitizedContent = DOMPurify.sanitize(blog.description);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </a>

        {/* Hero Section */}
        <header className="mb-12">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {blog.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
              {blog.author_name?.[0] || 'B'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{blog.author_name || 'Anonymous'}</p>
              <p className="text-sm">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.img && (
          <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl">
            <img 
              src={blog.img} 
              alt={blog.title} 
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Blog Content */}
        <BlogContent htmlContent={sanitizedContent} />

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Thanks for reading!</h3>
            <p className="text-gray-600">Shared by {blog.author_name}. Check out more stories on our dashboard.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
