import React from 'react';
import Skeleton from './Skeleton';

export default function BlogDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8">
        <Skeleton width="130px" height="36px" variant="circle" />
      </div>

      <header className="mb-12">
        <div className="flex gap-2 mb-5">
          <Skeleton width="70px" height="26px" variant="circle" />
          <Skeleton width="70px" height="26px" variant="circle" />
        </div>
        <Skeleton className="mb-4" height="56px" />
        <Skeleton className="mb-8 w-3/4" height="56px" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" width="48px" height="48px" />
            <div className="space-y-2">
              <Skeleton width="120px" height="16px" />
              <Skeleton width="180px" height="12px" />
            </div>
          </div>
          <Skeleton width="84px" height="44px" variant="circle" />
        </div>
      </header>

      <Skeleton className="mb-12 rounded-3xl border-2 border-ink" height="380px" />

      <div className="bg-card rounded-3xl p-8 md:p-12 border-2 border-ink shadow-[5px_5px_0_var(--ink)] mb-12 space-y-4">
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton width="90%" height="20px" />
        <div className="pt-4 space-y-4">
          <Skeleton height="20px" />
          <Skeleton width="95%" height="20px" />
          <Skeleton width="80%" height="20px" />
        </div>
        <div className="pt-4">
          <Skeleton height="150px" />
        </div>
      </div>
    </div>
  );
}
