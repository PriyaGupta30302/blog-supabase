'use client';

import React, { useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toggleLikeAction } from '@/app/actions';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useFeedback } from '@/context/FeedbackContext';

interface LikeButtonProps {
  blogId: string;
  initialLikes: number;
  initialIsLiked: boolean;
}

const PARTICLES = 8;

export default function LikeButton({ blogId, initialLikes, initialIsLiked }: LikeButtonProps) {
  const { user, isLoaded } = useUser();
  const { toast } = useFeedback();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);
  const heart = useRef<SVGSVGElement>(null);
  const particles = useRef<HTMLSpanElement[]>([]);

  const celebrate = () => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      heart.current,
      { scale: 0.4 },
      { scale: 1.1, duration: 0.9, ease: 'elastic.out(1, 0.35)' }
    );
    particles.current.forEach((p, i) => {
      const angle = (i / PARTICLES) * Math.PI * 2;
      gsap.fromTo(
        p,
        { x: 0, y: 0, scale: 1, opacity: 1 },
        {
          x: Math.cos(angle) * 46,
          y: Math.sin(angle) * 46,
          scale: 0,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
        }
      );
    });
  };

  const handleLike = async () => {
    if (!isLoaded || !user) {
      toast.info('Sign in to like this post.');
      return;
    }

    setLoading(true);
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);
    if (newIsLiked) celebrate();

    try {
      const result = await toggleLikeAction(blogId, user.id);
      if (!result.success) {
        // Revert on failure
        setIsLiked(!newIsLiked);
        setLikes(prev => !newIsLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Failed to like:', error);
      // Revert on failure
      setIsLiked(!newIsLiked);
      setLikes(prev => !newIsLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      aria-pressed={isLiked}
      className={`relative flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2.5 font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
        isLiked
          ? 'bg-accent-2 text-ink shadow-[3px_3px_0_var(--ink)]'
          : 'bg-card text-foreground shadow-[3px_3px_0_var(--ink)]'
      }`}
    >
      <span className="pointer-events-none absolute left-[2.1rem] top-1/2" aria-hidden="true">
        {Array.from({ length: PARTICLES }).map((_, i) => (
          <span
            key={i}
            ref={(node) => {
              if (node) particles.current[i] = node;
            }}
            className="absolute -ml-1 -mt-1 h-2 w-2 rounded-full bg-primary opacity-0"
          />
        ))}
      </span>
      <svg
        ref={heart}
        className="h-6 w-6"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{likes}</span>
    </button>
  );
}
