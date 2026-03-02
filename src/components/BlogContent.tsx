'use client';

import React from 'react';

interface BlogContentProps {
  htmlContent: string;
}

export default function BlogContent({ htmlContent }: BlogContentProps) {
  return (
    <article 
      className="prose prose-lg max-w-none 
        prose-headings:text-gray-900 prose-headings:font-extrabold
        prose-p:text-gray-700 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
        prose-img:rounded-3xl prose-img:shadow-lg
        prose-ul:list-disc prose-ol:list-decimal"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}
