'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

const SEEN_KEY = 'blogapp-intro-seen';

interface WelcomeIntroProps {
  /** Fired once the curtain has lifted (or immediately if the intro is skipped). */
  onComplete: () => void;
}

/**
 * Full-screen welcome curtain. Plays once per browser session, then lifts to
 * reveal the page underneath. Skipped for repeat visits and reduced-motion users.
 */
export default function WelcomeIntro({ onComplete }: WelcomeIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const [skipped, setSkipped] = useState(false);

  // Decide before first paint so returning visitors never see a flash.
  useLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {}
    if (seen || prefersReducedMotion()) {
      setSkipped(true);
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      if (skipped) return;

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(SEEN_KEY, '1');
          } catch {}
          setSkipped(true);
          onComplete();
        },
      });

      tl.from('.intro-line', {
        yPercent: 120,
        rotation: 4,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.18,
      })
        .from(
          '.intro-sticker',
          { scale: 0, rotation: -40, duration: 0.6, ease: 'back.out(2.4)', stagger: 0.12 },
          '-=0.5'
        )
        .from('.intro-bar-fill', { scaleX: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.6')
        .to('.intro-line, .intro-sticker', {
          yPercent: -120,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.in',
          stagger: 0.05,
        }, '+=0.25')
        .to(root.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.2');
    },
    { scope: root, dependencies: [skipped] }
  );

  if (skipped) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-primary text-primary-foreground"
      aria-hidden="true"
    >
      <div className="relative px-6 text-center font-display font-extrabold leading-[0.95] tracking-tight text-[clamp(2.75rem,10vw,8rem)]">
        <div className="overflow-hidden pb-2">
          <div className="intro-line">Welcome to</div>
        </div>
        <div className="overflow-hidden pb-2">
          <div className="intro-line">
            <span className="inline-block -rotate-2 border-2 border-ink bg-background px-4 text-foreground shadow-[6px_6px_0_var(--ink)]">
              BlogApp
            </span>
          </div>
        </div>
        <div className="overflow-hidden pt-4 pb-2">
          <div className="intro-line text-[clamp(1.1rem,3vw,2rem)] font-semibold tracking-normal">
            Stories and ideas worth reading.
          </div>
        </div>

        <span className="intro-sticker absolute -left-2 top-0 hidden rotate-[-12deg] border-2 border-ink bg-accent-2 px-3 py-1 text-base font-bold text-ink shadow-[3px_3px_0_var(--ink)] sm:block md:-left-16">
          ✨ Fresh reads
        </span>
        <span className="intro-sticker absolute -right-2 bottom-4 hidden rotate-[8deg] border-2 border-ink bg-background px-3 py-1 text-base font-bold text-foreground shadow-[3px_3px_0_var(--ink)] sm:block md:-right-20">
          Curated
        </span>
      </div>

      <div className="absolute bottom-12 h-2 w-40 overflow-hidden rounded-full border-2 border-ink bg-background/40">
        <div className="intro-bar-fill h-full origin-left bg-ink" />
      </div>
    </div>
  );
}
