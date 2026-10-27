'use client';

import React, { useMemo } from 'react';
import DOMPurify from "isomorphic-dompurify";

interface BlogContentProps {
  htmlContent: string;
}

export default function BlogContent({ htmlContent }: BlogContentProps) {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(htmlContent);
  }, [htmlContent]);

  return (
    <article 
      data-prose
      className="prose prose-lg dark:prose-invert max-w-none break-words overflow-x-hidden
        prose-headings:font-display prose-headings:text-foreground prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:mb-3 prose-headings:mt-10 first:prose-headings:mt-0
        prose-p:text-foreground/80 prose-p:leading-[1.8] prose-p:my-4
        prose-a:text-foreground prose-a:font-bold prose-a:underline prose-a:decoration-primary prose-a:decoration-4 prose-a:underline-offset-4 hover:prose-a:bg-primary hover:prose-a:text-primary-foreground
        prose-strong:text-foreground prose-strong:font-bold
        prose-blockquote:not-italic prose-blockquote:font-semibold prose-blockquote:border-2 prose-blockquote:border-ink prose-blockquote:bg-primary-light prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-2xl prose-blockquote:shadow-[4px_4px_0_var(--ink)] prose-blockquote:text-foreground prose-blockquote:my-10
        prose-img:rounded-2xl prose-img:border-2 prose-img:border-ink prose-img:shadow-[6px_6px_0_var(--ink)] prose-img:my-12
        prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-foreground/80 prose-li:my-2 prose-li:marker:text-primary
        prose-hr:border-ink/20 prose-hr:my-10"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
}



