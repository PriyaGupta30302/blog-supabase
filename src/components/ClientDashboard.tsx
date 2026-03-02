'use client';

import React, { useState } from 'react';
import BlogForm from '@/components/BlogForm';

interface Blog {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  created_at: string;
}

export default function ClientDashboard({ user, initialBlogs }: { user: any, initialBlogs: Blog[] }) {
  const [showForm, setShowForm] = useState(false);
  const blogs = initialBlogs;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName || user?.username || 'Blogger'}!
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 shadow-md"
        >
          {showForm ? 'Cancel' : 'Create New Blog'}
        </button>
      </div>

      {showForm && (
        <div className="mb-12 max-w-2xl mx-auto">
          <BlogForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition duration-300 group">
              {blog.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.image_url} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <span className="text-blue-200 text-5xl font-bold">{blog.title[0]}</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{blog.author_id === user?.id ? 'Your post' : 'Public'}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition duration-200 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {blog.content}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <button className="text-blue-600 font-semibold text-sm hover:translate-x-1 transition duration-200 flex items-center">
                    Read More 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No blogs yet</h3>
            <p className="text-gray-500 mt-1">Be the first to share something amazing!</p>
          </div>
        )}
      </div>
    </main>
  );
}
