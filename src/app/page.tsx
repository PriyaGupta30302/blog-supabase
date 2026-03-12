'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import PageLoader from '@/components/PageLoader';

import { stripHtml, formatDate } from '@/lib/text-utils';

interface Blog {
  id: string;
  title: string;
  description?: string;
  content?: string;
  img: string | null;
  author_name: string;
  tags: string[];
  slug: string;
  created_at: string;
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Categories
      const { data: catData, error: catError } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      // 2. Fetch Blogs
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (data) setBlogs(data);
      setLoading(false);
    }
    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    // Initial Page Loader timer
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Latest <span className="text-primary">Stories</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Discover the latest thoughts, ideas, and stories from our community.
          </p> 
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === '' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-card text-foreground/60 hover:bg-card-border'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-card text-foreground/60 hover:bg-card-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Blog Grid */}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-card-border hover:shadow-xl transition-all duration-300 group flex flex-col">
                <Link href={`/blog/${blog.slug}`} className="block">
                  {blog.img ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={blog.img} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-primary-light flex items-center justify-center">
                      <span className="text-primary text-5xl font-bold">{blog.title[0]}</span>
                    </div>
                  )}
                </Link>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-foreground/40 mb-3 space-x-2">
                    <span>{formatDate(blog.created_at)}</span>
                    <span>•</span>
                    <span>Public</span>
                  </div>
                  
                  <Link href={`/blog/${blog.slug}`}>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>
                  
                  <p className="text-foreground/60 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {stripHtml(blog.description || blog.content || '')}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-card-border flex items-center justify-end">
                    <Link 
                      href={`/blog/${blog.slug}`}
                      className="text-primary font-semibold text-sm hover:translate-x-1 transition duration-200 flex items-center"
                    >
                      Read More 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted rounded-3xl border-2 border-dashed border-card-border">
            <h2 className="text-2xl font-bold text-foreground/30">No stories found</h2>
            <p className="text-foreground/40 mt-2">Try publishing something amazing from the dashboard!</p>
          </div>
        )}
      </main>
    </div>
  );
}
