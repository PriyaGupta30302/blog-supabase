'use client';

import React from 'react';

interface BlogContentProps {
  htmlContent: string;
}

export default function BlogContent({ htmlContent }: BlogContentProps) {
  return (
    <article 
      className="prose prose-lg max-w-none 
        prose-headings:text-gray-900 prose-headings:font-extrabold prose-headings:tracking-tight
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
        prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-bold
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-10
        prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12
        prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:my-2
        prose-hr:border-gray-100 prose-hr:my-16"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}
