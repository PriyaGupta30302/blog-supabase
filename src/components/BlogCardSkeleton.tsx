import React from 'react';
import Skeleton from './Skeleton';

export default function BlogCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl overflow-hidden border-2 border-ink shadow-[5px_5px_0_var(--ink)] flex flex-col h-full">
      <Skeleton className="h-52 rounded-none border-b-2 border-ink" variant="rectangle" />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex gap-2 mb-4">
          <Skeleton width="64px" height="22px" variant="circle" />
          <Skeleton width="48px" height="22px" variant="circle" />
        </div>

        <Skeleton className="mb-2" height="26px" />
        <Skeleton className="mb-4" width="75%" height="26px" />

        <div className="space-y-2 mb-6">
          <Skeleton height="14px" />
          <Skeleton height="14px" />
          <Skeleton width="60%" height="14px" />
        </div>

        <div className="mt-auto flex justify-between items-center">
          <Skeleton width="90px" height="14px" />
          <Skeleton width="96px" height="36px" variant="circle" />
        </div>
      </div>
    </div>
  );
}
