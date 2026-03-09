'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BlogDetailSkeleton from '@/components/BlogDetailSkeleton';
import PageLoader from '@/components/PageLoader';

export default function BlogLoading() {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      {showSkeleton ? <BlogDetailSkeleton /> : <PageLoader />}
    </div>
  );
}
