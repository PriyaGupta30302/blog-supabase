'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ShareButton from '@/components/ShareButton';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { stripHtml, formatDate, readingTime } from '@/lib/text-utils';

export interface BlogCardData {
  id: string;
  title: string;
  description?: string;
  content?: string;
  img: string | null;
  author_name: string;
  tags: string[];
  slug: string;
  created_at: string;
}

interface BlogCardProps {
  blog: BlogCardData;
  index: number;
  featured?: boolean;
}

const RESTING_TILT = [-1.2, 0.9, -0.6, 1.1];
const FALLBACKS = [
  'bg-primary text-primary-foreground',
  'bg-accent-2 text-ink',
  'bg-primary-light text-foreground',
];

export default function BlogCard({ blog, index, featured = false }: BlogCardProps) {
  const card = useRef<HTMLElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const body = blog.description || blog.content || '';
  const restTilt = featured ? 0 : RESTING_TILT[index % RESTING_TILT.length];

  useGSAP(
    () => {
      const el = card.current;
      if (!el) return;
      gsap.set(el, { rotation: restTilt, transformPerspective: 900 });
      if (prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return;

      const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' });
      const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });
      const imgX = gsap.quickTo(image.current, 'x', { duration: 0.6, ease: 'power3' });
      const imgY = gsap.quickTo(image.current, 'y', { duration: 0.6, ease: 'power3' });

      const onEnter = () =>
        gsap.to(el, { rotation: 0, y: -8, duration: 0.35, ease: 'back.out(2)' });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * 6);
        rotX(-py * 6);
        imgX(-px * 14);
        imgY(-py * 14);
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        imgX(0);
        imgY(0);
        gsap.to(el, { rotation: restTilt, y: 0, duration: 0.5, ease: 'power3.out' });
      };

      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: card, dependencies: [restTilt] }
  );

  return (
    <article
      ref={card}
      className={`group relative flex h-full rounded-3xl border-2 border-ink bg-card shadow-[5px_5px_0_var(--ink)] transition-shadow duration-300 hover:shadow-[10px_10px_0_var(--ink)] ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {/* Whole-card link; the share button sits above it so it stays clickable */}
      <Link
        href={`/blog/${blog.slug}`}
        aria-label={blog.title}
        className="absolute inset-0 z-0 rounded-3xl"
      />

      {/* Cover */}
      <div
        className={`pointer-events-none relative overflow-hidden border-ink ${
          featured
            ? 'h-64 rounded-t-[1.35rem] border-b-2 md:h-auto md:w-1/2 md:rounded-l-[1.35rem] md:rounded-tr-none md:border-b-0 md:border-r-2'
            : 'h-52 rounded-t-[1.35rem] border-b-2'
        }`}
      >
        <div ref={image} className="relative h-full w-full scale-110">
          {blog.img ? (
            <Image
              src={blog.img}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center font-display text-9xl font-extrabold ${
                FALLBACKS[index % FALLBACKS.length]
              }`}
            >
              {blog.title[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <span className="absolute left-3 top-3 -rotate-3 border-2 border-ink bg-background px-2.5 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0_var(--ink)]">
          {formatDate(blog.created_at)}
        </span>
        {featured && (
          <span className="absolute right-3 top-3 rotate-3 border-2 border-ink bg-accent-2 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)]">
            ★ latest
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`pointer-events-none relative flex flex-1 flex-col p-6 ${featured ? 'md:p-10' : ''}`}>
        {blog.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {blog.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border-2 border-ink bg-primary-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h3
          className={`font-display font-extrabold leading-tight tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary line-clamp-3 ${
            featured ? 'text-3xl md:text-4xl' : 'text-2xl'
          }`}
        >
          {blog.title}
        </h3>

        <p
          className={`mt-3 text-foreground/65 leading-relaxed ${
            featured ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm'
          }`}
        >
          {stripHtml(body)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <div className="pointer-events-auto relative z-10 flex items-center gap-3">
            <ShareButton
              title={blog.title}
              text={stripHtml(body).slice(0, 100)}
              url={typeof window !== 'undefined' ? `${window.location.origin}/blog/${blog.slug}` : undefined}
              variant="icon"
            />
            <span className="text-xs font-semibold text-foreground/50">
              {readingTime(body)} min read
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[2px_2px_0_var(--ink)] transition-all group-hover:gap-3">
            Read it
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}
