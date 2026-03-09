import React from 'react';
import Skeleton from './Skeleton';

export default function AdminSkeleton() {
  return (
    <div className="bg-card rounded-3xl shadow-lg border border-card-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-card-border">
            <tr>
              <th className="px-8 py-5"><Skeleton width="100px" height="12px" /></th>
              <th className="px-8 py-5"><Skeleton width="80px" height="12px" /></th>
              <th className="px-8 py-5"><Skeleton width="60px" height="12px" /></th>
              <th className="px-8 py-5"><Skeleton width="80px" height="12px" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    <Skeleton width="4rem" height="3rem" className="mr-4 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton width="200px" height="16px" />
                      <Skeleton width="120px" height="12px" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    <Skeleton variant="circle" width="28px" height="28px" className="mr-2" />
                    <Skeleton width="80px" height="14px" />
                  </div>
                </td>
                <td className="px-8 py-6">
                  <Skeleton width="100px" height="14px" />
                </td>
                <td className="px-8 py-6">
                  <div className="flex space-x-3">
                    <Skeleton width="40px" height="32px" className="rounded-xl" />
                    <Skeleton width="40px" height="32px" className="rounded-lg" />
                    <Skeleton width="40px" height="32px" className="rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
