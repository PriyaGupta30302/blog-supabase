'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toggleLikeAction } from '@/app/actions';

interface LikeButtonProps {
  blogId: string;
  initialLikes: number;
  initialIsLiked: boolean;
}

export default function LikeButton({ blogId, initialLikes, initialIsLiked }: LikeButtonProps) {
  const { user, isLoaded } = useUser();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!isLoaded || !user) {
      alert('Please sign in to like this post!');
      return;
    }

    setLoading(true);
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

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
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
        isLiked 
          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
          : 'bg-muted text-foreground/60 hover:bg-card-border'
      }`}
    >
      <svg 
        className={`w-6 h-6 transition-transform ${isLiked ? 'scale-110' : ''}`} 
        fill={isLiked ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="font-bold">{likes}</span>
    </button>
  );
}
