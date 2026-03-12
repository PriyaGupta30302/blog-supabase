import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import BlogContent from "@/components/BlogContent";
import { incrementBlogViews, getBlogLikesCount, checkIfUserLiked, getBlogComments } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();

  // Artificial delay to ensure Page Loader (800ms) -> Skeleton (800ms) sequence is visible
  const [{ data: blog, error }] = await Promise.all([
    supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single(),
    new Promise(resolve => setTimeout(resolve, 1700)) // Slightly more than 1600ms for safety
  ]);

  if (error || !blog) {
    notFound();
  }

  // Fetch likes & comments data
  const [likesCount, isLiked, commentsResult] = await Promise.all([
    getBlogLikesCount(blog.id),
    userId ? checkIfUserLiked(blog.id, userId) : Promise.resolve(false),
    getBlogComments(blog.id)
  ]);

  // Increment views
  await incrementBlogViews(blog.id);

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
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-light px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4 text-foreground/60">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary">
                {blog.author_name?.[0] || 'B'}
              </div>
              <div>
                <p className="font-semibold text-foreground">{blog.author_name || 'Anonymous'}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <p>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <span className="text-foreground/30">•</span>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {blog.views || 0} views
                  </p>
                </div>
              </div>
            </div>

            <LikeButton 
              blogId={blog.id} 
              initialLikes={likesCount} 
              initialIsLiked={isLiked} 
            />
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
          <BlogContent htmlContent={blog.description || ''} />
        </div>

        {/* Comment Section */}
        <CommentSection blogId={blog.id} initialComments={(commentsResult.success ? commentsResult.data : []) as any} />

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
