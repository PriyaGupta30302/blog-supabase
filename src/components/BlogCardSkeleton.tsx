import React from 'react';
import Skeleton from './Skeleton';

export default function BlogCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-card-border flex flex-col h-full">
      {/* Image Skeleton */}
      <Skeleton className="h-48 rounded-none" variant="rectangle" />
      
      <div className="p-6 flex flex-col flex-1">
        {/* Date Skeleton */}
        <div className="flex items-center mb-3">
          <Skeleton width="100px" height="12px" />
        </div>
        
        {/* Title Skeleton */}
        <Skeleton className="mb-2" height="24px" />
        <Skeleton className="mb-4" width="80%" height="24px" />
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton height="14px" />
          <Skeleton height="14px" />
          <Skeleton width="60%" height="14px" />
        </div>
        
        {/* Footer Skeleton */}
        <div className="mt-auto pt-4 border-t border-card-border flex justify-end">
          <Skeleton width="80px" height="16px" />
        </div>
      </div>
    </div>
  );
}
