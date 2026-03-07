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
  const sanitizedContent = blog.description ? DOMPurify.sanitize(blog.description) : '';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center text-sm text-foreground/50 hover:text-primary mb-8 transition-colors">
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
                <span key={tag} className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-light px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center space-x-4 text-foreground/60">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary">
              {blog.author_name?.[0] || 'B'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{blog.author_name || 'Anonymous'}</p>
              <p className="text-sm">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.img && (
          <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl border border-card-border">
            <img 
              src={blog.img} 
              alt={blog.title} 
              className="w-full h-auto object-cover "
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-card-border mb-12">
          <BlogContent htmlContent={sanitizedContent} />
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-card-border">
          <div className="bg-muted rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">Thanks for reading!</h3>
            <p className="text-foreground/60">Shared by {blog.author_name}. Check out more stories on our dashboard.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
