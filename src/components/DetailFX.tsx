'use client';

import React, { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';

/**
 * Client wrapper that choreographs the blog detail page. The server page marks
 * elements with `d-*` classes / `data-reveal`; this component animates them.
 * Content is hidden via CSS (`.fx-pending`) until GSAP is ready, then revealed.
 */
export default function DetailFX({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      // Must come first: tweens below read the final (visible) state from CSS.
      el.classList.remove('fx-pending');
      if (prefersReducedMotion()) return;

      // Reading progress
      gsap.fromTo(
        '.d-progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.2 },
        }
      );

      // Hero entrance
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.d-back', { x: -24, opacity: 0, duration: 0.6 })
        .from('.d-tag', { scale: 0, rotation: -20, opacity: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.08 }, '-=0.3')
        .from('.split-word', { yPercent: 115, rotation: 4, duration: 0.9, stagger: 0.06 }, '-=0.4')
        .from('.d-meta', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .from('.d-image-frame', { y: 50, opacity: 0, duration: 0.8 }, '-=0.5')
        .fromTo(
          '.d-image-clip',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut' },
          '-=0.5'
        )
        .from('.d-image-clip img', { scale: 1.3, duration: 1.4, ease: 'power2.out' }, '<');

      // Sections fade up as they scroll in
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((section) => {
        gsap.from(section, {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 88%', once: true },
        });
      });

      // Article blocks stagger in as you read
      gsap.set('[data-prose] > *', { opacity: 0, y: 28 });
      ScrollTrigger.batch('[data-prose] > *', {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08, overwrite: true }),
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="fx-pending">
      <noscript>
        <style>{`.fx-pending .d-hide, .fx-pending .split-word { opacity: 1 !important; }`}</style>
      </noscript>
      <div className="d-progress fixed left-0 top-0 z-[60] h-1.5 w-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
      {children}
    </div>
  );
}
