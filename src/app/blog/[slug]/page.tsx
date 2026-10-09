import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import BlogContent from "@/components/BlogContent";
import { incrementBlogViews, getBlogLikesCount, checkIfUserLiked, getBlogComments } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import BlogAuthGuard from "@/components/BlogAuthGuard";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { stripHtml } from "@/lib/text-utils";

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'localhost:3000';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  return `https://${rawUrl}`;
}

async function getBlogBySlug(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug || '');
  
  const { data: blog1 } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', decodedSlug)
    .maybeSingle();

  if (blog1) return blog1;

  if (rawSlug !== decodedSlug) {
    const { data: blog2 } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', rawSlug)
      .maybeSingle();
    if (blog2) return blog2;
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    // Fetch blog safely without PostgREST .or syntax errors
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return {
        title: 'Story Not Found | BlogApp',
        description: 'Discover latest thoughts, ideas, and stories from our community.',
      };
    }

    const plainDescription = stripHtml(blog.description || blog.content || '').slice(0, 160) || 'Discover thoughts, ideas, and stories from our community on BlogApp.';
    const baseUrl = getBaseUrl();
    const pageUrl = `${baseUrl}/blog/${blog.slug || slug}`;
    
    const dynamicOgUrl = `${pageUrl}/opengraph-image`;
    
    // Convert blog.img to absolute URL if present
    let rawImgUrl: string | null = null;
    if (blog.img) {
      if (blog.img.startsWith('http://') || blog.img.startsWith('https://')) {
        rawImgUrl = blog.img;
      } else {
        rawImgUrl = `${baseUrl}${blog.img.startsWith('/') ? '' : '/'}${blog.img}`;
      }
    }

    const imagesList = [];

    // Prioritize the blog's raw featured image first if available
    if (rawImgUrl) {
      imagesList.push({
        url: rawImgUrl,
        secureUrl: rawImgUrl,
        width: 1200,
        height: 630,
        alt: blog.title,
      });
    }

    // Always include dynamic OG image generator as fallback
    imagesList.push({
      url: dynamicOgUrl,
      secureUrl: dynamicOgUrl,
      width: 1200,
      height: 630,
      alt: blog.title,
      type: 'image/png',
    });

    return {
      title: `${blog.title} | BlogApp`,
      description: plainDescription,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title: blog.title,
        description: plainDescription,
        url: pageUrl,
        siteName: 'BlogApp',
        type: 'article',
        publishedTime: blog.created_at,
        authors: blog.author_name ? [blog.author_name] : undefined,
        tags: blog.tags || [],
        images: imagesList,
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: plainDescription,
        images: rawImgUrl ? [rawImgUrl, dynamicOgUrl] : [dynamicOgUrl],
      },
    };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return {
      title: 'Blog | Read Stories',
      description: 'Discover latest thoughts, ideas, and stories from our community.',
    };
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Safely get userId from Clerk without throwing build-time errors
  let userId: string | null = null;
  try {
    const authData = await auth();
    userId = authData?.userId || null;
  } catch (authErr) {
    userId = null;
  }

  // Fetch blog data safely using getBlogBySlug
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Fetch likes & comments data concurrently
  const [likesCount, isLiked, commentsResult] = await Promise.all([
    getBlogLikesCount(blog.id),
    userId ? checkIfUserLiked(blog.id, userId) : Promise.resolve(false),
    getBlogComments(blog.id)
  ]);

  // Increment views asynchronously
  await incrementBlogViews(blog.id);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-foreground/50 hover:text-primary mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

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

            <div className="flex items-center space-x-3">
              <ShareButton 
                title={blog.title} 
                text={stripHtml(blog.description || blog.content || '').slice(0, 100)} 
              />
              <LikeButton 
                blogId={blog.id} 
                initialLikes={likesCount} 
                initialIsLiked={isLiked} 
              />
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.img && (
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-card-border">
            <Image 
              src={blog.img} 
              alt={blog.title} 
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Blog Content & Comments Protected by Auth Guard */}
        <BlogAuthGuard blogTitle={blog.title}>
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-card-border mb-12">
            <BlogContent htmlContent={blog.description || ''} />
          </div>

          {/* Comment Section */}
          <CommentSection blogId={blog.id} initialComments={(commentsResult.success ? commentsResult.data : []) as any} />
        </BlogAuthGuard>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-card-border">
          <div className="bg-muted rounded-2xl p-8 text-center flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">Thanks for reading!</h3>
            <p className="text-foreground/60 mb-6">Shared by {blog.author_name}. Check out more stories on our community.</p>
            <ShareButton 
              title={blog.title} 
              text={stripHtml(blog.description || blog.content || '').slice(0, 100)} 
            />
          </div>
        </footer>
      </main>
    </div>
  );
}


