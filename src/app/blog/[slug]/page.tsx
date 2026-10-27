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
import { stripHtml, readingTime } from "@/lib/text-utils";
import DetailFX from "@/components/DetailFX";
import SplitWords from "@/components/SplitWords";

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
    <div className="min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-300">
      <Header />

      <DetailFX>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Back Link */}
          <Link
            href="/"
            className="d-back d-hide mb-10 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-2 text-sm font-bold shadow-[3px_3px_0_var(--ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 12H5m6-6-6 6 6 6" />
            </svg>
            back to feed
          </Link>

          {/* Hero Section */}
          <header className="mb-12">
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-3">
                {blog.tags.map((tag: string, i: number) => (
                  <span
                    key={tag}
                    className={`d-tag d-hide border-2 border-ink bg-primary-light px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-foreground shadow-[2px_2px_0_var(--ink)] ${
                      i % 2 === 0 ? '-rotate-2' : 'rotate-2'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mb-8 font-display text-[clamp(2.25rem,7vw,4.75rem)] font-extrabold leading-[1.02] tracking-tight">
              <SplitWords text={blog.title} />
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="d-meta d-hide flex items-center gap-4">
                <div className="grid h-12 w-12 -rotate-6 place-items-center border-2 border-ink bg-accent-2 font-display text-xl font-extrabold text-ink shadow-[3px_3px_0_var(--ink)]">
                  {blog.author_name?.[0]?.toUpperCase() || 'B'}
                </div>
                <div>
                  <p className="font-bold text-foreground">{blog.author_name || 'Anonymous'}</p>
                  <div className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-foreground/60">
                    <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-primary">✦</span>
                    <span>{readingTime(blog.description || '')} min read</span>
                    <span className="text-primary">✦</span>
                    <span className="inline-flex items-center">
                      <svg className="mr-1 h-4 w-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {blog.views || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-meta d-hide flex items-center gap-3">
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
            <div className="d-image-frame d-hide mb-14 overflow-hidden rounded-3xl border-2 border-ink bg-card shadow-[8px_8px_0_var(--ink)]">
              <div className="d-image-clip relative h-[260px] w-full sm:h-[400px] md:h-[480px]">
                <Image
                  src={blog.img}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Blog Content & Comments Protected by Auth Guard */}
          <BlogAuthGuard blogTitle={blog.title}>
            <div data-reveal className="d-hide mb-16 rounded-3xl border-2 border-ink bg-card p-6 shadow-[8px_8px_0_var(--ink)] sm:p-10 md:p-14">
              <BlogContent htmlContent={blog.description || ''} />
            </div>

            {/* Comment Section */}
            <div data-reveal className="d-hide">
              <CommentSection blogId={blog.id} initialComments={(commentsResult.success ? commentsResult.data : []) as any} />
            </div>
          </BlogAuthGuard>

          {/* Footer Info */}
          <footer data-reveal className="d-hide mt-20">
            <div className="-rotate-1 rounded-3xl border-2 border-ink bg-primary p-8 text-center text-primary-foreground shadow-[8px_8px_0_var(--ink)] sm:p-12">
              <h3 className="font-display text-3xl font-extrabold sm:text-4xl">thanks for reading ✌️</h3>
              <p className="mx-auto mt-3 max-w-md font-medium opacity-90">
                Shared by {blog.author_name || 'Anonymous'}. There&apos;s plenty more where that came from.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ShareButton
                title={blog.title}
                text={stripHtml(blog.description || blog.content || '').slice(0, 100)}
              />
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-background px-6 py-3 font-bold text-foreground shadow-[4px_4px_0_var(--ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                more stories →
              </Link>
              </div>
            </div>
          </footer>
        </main>
      </DetailFX>
    </div>
  );
}
