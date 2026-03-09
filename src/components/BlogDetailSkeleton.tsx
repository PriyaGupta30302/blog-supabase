import React from 'react';
import Skeleton from './Skeleton';

export default function BlogDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back Link Skeleton */}
      <div className="mb-8">
        <Skeleton width="100px" height="16px" />
      </div>

      {/* Hero Section Skeleton */}
      <header className="mb-12">
        <div className="flex gap-2 mb-4">
          <Skeleton width="60px" height="24px" />
          <Skeleton width="60px" height="24px" />
        </div>
        <Skeleton className="mb-6" height="48px" />
        <Skeleton className="mb-6 w-3/4" height="48px" />
        
        <div className="flex items-center space-x-4">
          <Skeleton variant="circle" width="40px" height="40px" />
          <div className="space-y-2">
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100px" height="12px" />
          </div>
        </div>
      </header>

      {/* Featured Image Skeleton */}
      <Skeleton className="mb-12 rounded-3xl" height="400px" />

      {/* Blog Content Skeleton */}
      <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-card-border mb-12 space-y-4">
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton width="90%" height="20px" />
        <div className="pt-4">
          <Skeleton height="20px" />
          <Skeleton width="95%" height="20px" />
          <Skeleton width="80%" height="20px" />
        </div>
        <div className="pt-4">
          <Skeleton height="150px" />
        </div>
      </div>

      {/* Footer Info Skeleton */}
      <footer className="mt-16 pt-8 border-t border-card-border">
        <div className="bg-muted rounded-2xl p-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton width="200px" height="24px" />
            <Skeleton width="300px" height="16px" />
          </div>
        </div>
      </footer>
    </div>
  );
}
