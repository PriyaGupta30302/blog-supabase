'use client';

import React from 'react';
import Header from '@/components/Header';
import BlogForm from '@/components/BlogForm';
import { useRouter } from 'next/navigation';

export default function CreateBlogPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 transition-colors duration-300">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-foreground/50 mt-1">Create a new blog post</p>
          </div>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-card text-foreground px-6 py-2 rounded-full font-bold transition-all duration-200 flex items-center gap-2 border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancel
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <BlogForm onSuccess={() => router.push('/admin')} />
        </div>
      </main>
    </div>
  );
}

