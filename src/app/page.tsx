'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setBlogs(data);
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Latest <span className="text-blue-600">Stories</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Discover the latest thoughts, ideas, and stories from our community.
          </p> 
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-3xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition duration-300 group flex flex-col">
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
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <span className="text-blue-200 text-5xl font-bold">{blog.title[0]}</span>
                    </div>
                  )}
                </Link>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                    <span>{formatDate(blog.created_at)}</span>
                    <span>•</span>
                    <span>Public</span>
                  </div>
                  
                  <Link href={`/blog/${blog.slug}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition duration-200 line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {stripHtml(blog.description || blog.content || '')}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-end">
                    <Link 
                      href={`/blog/${blog.slug}`}
                      className="text-blue-600 font-semibold text-sm hover:translate-x-1 transition duration-200 flex items-center"
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
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <h2 className="text-2xl font-bold text-gray-400">No stories found</h2>
            <p className="text-gray-500 mt-2">Try publishing something amazing from the dashboard!</p>
          </div>
        )}
      </main>
    </div>
  );
}
