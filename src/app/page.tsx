'use client';

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import BlogCard, { BlogCardData } from '@/components/BlogCard';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import WelcomeIntro from '@/components/WelcomeIntro';
import SplitWords from '@/components/SplitWords';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';

interface Category {
  id: string;
  name: string;
}

const DEFAULT_TICKER = ['Fresh reads', 'Deep dives', 'Ideas', 'Insights', 'Stories', 'Read more'];

export default function Home() {
  const [blogs, setBlogs] = useState<BlogCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heroGo, setHeroGo] = useState(false);
  const page = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      // 2. Fetch Blogs
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      if (data) setBlogs(data);
    } catch (err) {
      console.error("Error fetching homepage blogs:", err);
      setErrorMsg("Unable to fetch stories. If your database was recently paused, please try refreshing in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Hero: plays once, timed with the welcome curtain lifting (hidden until then).
  useGSAP(
    () => {
      if (!heroGo) return;
      // Un-hide first so the tweens below read the visible end state.
      page.current?.classList.remove('hero-pending');
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero-word', { yPercent: 115, rotation: 5, duration: 1, stagger: 0.09 })
        .from('.hero-hit', { scale: 0.6, rotation: -10, duration: 0.7, ease: 'back.out(2.5)' }, '-=0.6')
        .from('.hero-sub', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-cta', { y: 24, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .from(
          '.hero-sticker',
          { scale: 0, rotation: -30, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12 },
          '-=0.6'
        );

      gsap.to('.hero-sticker', {
        y: -12,
        duration: 2.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.4, from: 'random' },
      });

      // Parallax drift on scroll
      gsap.to('.hero-sticker', {
        yPercent: -40,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: page, dependencies: [heroGo] }
  );

  // Cards: staggered scroll-in, re-run whenever the list changes.
  // They sit below the fold, so this can arm while the welcome curtain is still up.
  useGSAP(
    () => {
      if (loading || prefersReducedMotion()) return;

      gsap.set('.blog-card-wrap', { autoAlpha: 0, y: 70, scale: 0.96 });
      ScrollTrigger.batch('.blog-card-wrap', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
            overwrite: true,
          }),
      });
    },
    { scope: page, dependencies: [loading, blogs], revertOnUpdate: true }
  );

  const tickerItems = categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_TICKER;
  const [featured, ...rest] = blogs;
  const showFeatured = !!featured && blogs.length > 1;

  return (
    <div ref={page} className="hero-pending min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-300">
      <WelcomeIntro onReveal={() => setHeroGo(true)} />
      <Header />

      {/* Hero */}
      <section className="hero relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <span className="hero-sticker absolute left-2 top-6 hidden -rotate-12 border-2 border-ink bg-accent-2 px-3 py-1.5 text-sm font-extrabold text-ink shadow-[3px_3px_0_var(--ink)] md:block lg:left-10 lg:top-14">
          ✨ Fresh reads
        </span>
        <span className="hero-sticker absolute right-2 top-24 hidden rotate-6 rounded-full border-2 border-ink bg-card px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0_var(--ink)] md:block lg:right-10">
          📚 {blogs.length || '∞'} stories
        </span>
        <span className="hero-sticker absolute bottom-16 right-[18%] hidden rotate-[-5deg] border-2 border-ink bg-primary px-3 py-1.5 text-sm font-extrabold text-primary-foreground shadow-[3px_3px_0_var(--ink)] lg:block">
          Curated
        </span>

        <h1 className="mx-auto max-w-5xl text-center font-display text-[clamp(3rem,10vw,8.5rem)] font-extrabold leading-[0.92] tracking-tight">
          <SplitWords text="stories that" wordClassName="hero-word" />
          <br />
          <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <span className="hero-word inline-block">actually</span>
          </span>{' '}
          <span className="hero-hit inline-block -rotate-3 border-2 border-ink bg-primary px-3 text-primary-foreground shadow-[6px_6px_0_var(--ink)] sm:px-5">
            hit.
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-8 max-w-xl text-center text-lg text-foreground/65 sm:text-xl">
          Fresh takes, deep dives and random brain dumps from our community. Scroll, read, vibe.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#feed"
            className="hero-cta rounded-full border-2 border-ink bg-ink px-7 py-3.5 text-base font-bold text-background shadow-[4px_4px_0_var(--primary)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--primary)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Start reading ↓
          </a>
        </div>
      </section>

      {/* Ticker */}
      <div className="marquee -rotate-1 border-y-2 border-ink bg-primary py-3 text-primary-foreground" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-wide"
                >
                  <span className="px-6">{item}</span>
                  <span className="text-ink">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main id="feed" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {[{ id: '', name: 'All Topics' }, ...categories].map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id || 'all'}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full border-2 border-ink px-5 py-2 text-sm font-bold transition-all ${
                  active
                    ? 'translate-x-0.5 translate-y-0.5 bg-primary text-primary-foreground shadow-none'
                    : 'bg-card text-foreground shadow-[3px_3px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Blog Grid */}
        {errorMsg ? (
          <div className="mx-auto max-w-xl rotate-1 rounded-3xl border-2 border-ink bg-card px-6 py-14 text-center shadow-[6px_6px_0_var(--ink)]">
            <h3 className="font-display text-2xl font-extrabold text-foreground">connection hiccup 🔌</h3>
            <p className="mb-6 mt-2 text-sm text-foreground/70">{errorMsg}</p>
            <button
              onClick={fetchData}
              className="rounded-full border-2 border-ink bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-[3px_3px_0_var(--ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {showFeatured && (
              <div className="blog-card-wrap relative hover:z-30 focus-within:z-30 md:col-span-2 lg:col-span-3">
                <BlogCard blog={featured} index={0} featured />
              </div>
            )}
            {(showFeatured ? rest : blogs).map((blog, i) => (
              <div key={blog.id} className="blog-card-wrap relative hover:z-30 focus-within:z-30">
                <BlogCard blog={blog} index={i + 1} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rotate-1 rounded-3xl border-2 border-dashed border-ink bg-card py-24 text-center">
            <h2 className="font-display text-3xl font-extrabold">nothing here (yet) 👀</h2>
            <p className="mt-2 text-foreground/60">Try another topic, or publish something fire from the dashboard.</p>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-ink bg-card py-8 text-center text-sm font-semibold text-foreground/60">
        made with <span className="text-primary">♥</span> · BlogApp
      </footer>
    </div>
  );
}
