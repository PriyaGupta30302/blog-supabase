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
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-foreground/50 mt-1">Create a new blog post</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-card border border-card-border text-foreground/60 px-6 py-2 rounded-lg font-medium hover:bg-muted hover:text-primary hover:border-primary/30 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancel
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <BlogForm onSuccess={() => router.push('/dashboard')} />
        </div>
      </main>
    </div>
  );
}

