'use client';

import React, { useState } from 'react';
import BlogForm from '@/components/BlogForm';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { deleteBlogImage } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface Blog {
  id: string;
  title: string;
  content?: string;
  description?: string;
  img: string | null;
  image_url?: string | null;
  author_id: string;
  slug: string;
  created_at: string;
}

export default function ClientDashboard({ user, initialBlogs }: { user: any, initialBlogs: Blog[] }) {
  const [showForm, setShowForm] = useState(false);
  const [currentBlogs, setCurrentBlogs] = useState(initialBlogs);
  const router = useRouter();

  const stripHtml = (html: string) => {
    // First decode basic entities that might contain < or >
    const decoded = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
    
    // Then strip all tags
    return decoded.replace(/<[^>]*>?/gm, '');
  };

  const handleDelete = async (blog: Blog) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      // 1. Delete image from storage first if it exists
      const imageToDelete = blog.img || blog.image_url;
      if (imageToDelete) {
        try {
          await deleteBlogImage(imageToDelete);
        } catch (imgErr: any) {
          console.error('Image cleanup failed:', imgErr);
          alert(`Warning: Image cleanup failed (${imgErr.message}). The blog record will still be deleted.`);
        }
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blog.id);

      if (dbError) throw dbError;

      // 3. Update local state
      setCurrentBlogs(currentBlogs.filter((b) => b.id !== blog.id));
      alert('Blog deleted successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog: ' + error.message);
    }
  };

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
          <BlogForm onSuccess={() => {
            setShowForm(false);
            router.refresh();
          }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentBlogs.length > 0 ? (
          currentBlogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition duration-300 group flex flex-col">
              {(blog.img || blog.image_url) ? (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.img || blog.image_url || ''} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <span className="text-blue-200 text-5xl font-bold">{blog.title[0]}</span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{blog.author_id === user?.id ? 'Your post' : 'Public'}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition duration-200 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {stripHtml(blog.description || blog.content || '')}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/blog/${blog.slug}`}
                      className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition duration-200"
                      title="View Blog"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/dashboard/edit/${blog.id}`}
                      className="text-green-600 p-2 hover:bg-green-50 rounded-lg transition duration-200"
                      title="Edit Blog"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDelete(blog)}
                      className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition duration-200"
                      title="Delete Blog"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
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
