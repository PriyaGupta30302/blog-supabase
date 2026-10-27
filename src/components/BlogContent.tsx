'use client';

import React, { useMemo, useRef } from 'react';
import DOMPurify from "isomorphic-dompurify";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';

interface BlogContentProps {
  htmlContent: string;
}

export default function BlogContent({ htmlContent }: BlogContentProps) {
  const article = useRef<HTMLElement>(null);
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(htmlContent);
  }, [htmlContent]);

  // Animations live here (not in the page wrapper) because this component only
  // mounts once the auth guard lets the article through.
  useGSAP(
    () => {
      const el = article.current;
      if (!el || prefersReducedMotion()) return;

      // Blocks rise in as you read
      const blocks = Array.from(el.children) as HTMLElement[];
      gsap.set(blocks, { opacity: 0, y: 28 });
      ScrollTrigger.batch(blocks, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08, overwrite: true }),
      });

      // Highlighter swipes draw in under headings
      el.querySelectorAll<HTMLElement>('h2, h3').forEach((heading) => {
        gsap.fromTo(
          heading,
          { '--hl': '0%' },
          {
            '--hl': '100%',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
          }
        );
      });

      // Inline highlights pop
      el.querySelectorAll<HTMLElement>('mark').forEach((mark) => {
        gsap.from(mark, {
          backgroundSize: '0% 100%',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: mark, start: 'top 88%', once: true },
        });
      });

      // Images settle with a little pop
      el.querySelectorAll<HTMLElement>('img').forEach((img) => {
        gsap.from(img, {
          scale: 0.92,
          rotation: -1.5,
          duration: 0.9,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: img, start: 'top 90%', once: true },
        });
      });
    },
    { scope: article, dependencies: [sanitizedContent], revertOnUpdate: true }
  );

  return (
    <article
      ref={article}
      data-prose
      className="story prose prose-lg dark:prose-invert max-w-none break-words overflow-x-hidden
        prose-headings:font-display prose-headings:text-foreground prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:mb-4 prose-headings:mt-12 first:prose-headings:mt-0
        prose-p:text-foreground/80 prose-p:leading-[1.85] prose-p:my-5
        prose-a:text-foreground prose-a:font-bold prose-a:underline prose-a:decoration-primary prose-a:decoration-4 prose-a:underline-offset-4 hover:prose-a:bg-primary hover:prose-a:text-primary-foreground
        prose-strong:text-foreground prose-strong:font-bold
        prose-blockquote:not-italic prose-blockquote:font-semibold prose-blockquote:border-2 prose-blockquote:border-ink prose-blockquote:bg-primary-light prose-blockquote:py-4 prose-blockquote:pt-8 prose-blockquote:px-6 prose-blockquote:rounded-2xl prose-blockquote:shadow-[4px_4px_0_var(--ink)] prose-blockquote:text-foreground prose-blockquote:my-10
        prose-img:rounded-2xl prose-img:border-2 prose-img:border-ink prose-img:shadow-[6px_6px_0_var(--ink)] prose-img:my-12
        prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-foreground/80 prose-li:my-2
        prose-hr:my-10"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
