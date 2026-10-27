import React from 'react';
import Header from '@/components/Header';
import BlogDetailSkeleton from '@/components/BlogDetailSkeleton';

// Shown by Next.js only while the post is actually being fetched (slow network).
export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <BlogDetailSkeleton />
    </div>
  );
}
