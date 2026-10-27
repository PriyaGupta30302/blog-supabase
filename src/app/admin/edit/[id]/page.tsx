'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BlogForm from '@/components/BlogForm';
import Header from '@/components/Header';

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching blog:', error);
        alert('Failed to load blog post');
        router.push('/admin');
      } else {
        setBlog(data);
      }
      setLoading(false);
    }

    fetchBlog();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ink border-t-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-1 bg-card text-foreground px-5 py-2 rounded-full font-bold text-sm transition-all border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <BlogForm 
          initialData={blog} 
          onSuccess={() => {
            alert('Blog updated successfully!');
            router.push('/admin');
            router.refresh();
          }} 
        />
      </main>
    </div>
  );
}
