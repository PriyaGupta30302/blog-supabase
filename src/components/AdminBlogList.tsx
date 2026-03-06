'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { deleteBlogImage } from '@/lib/storage';
import { deleteBlogAction } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/text-utils';

interface Blog {
  id: string;
  title: string;
  img?: string;
  author_name?: string;
  tags?: string[];
  slug: string;
  created_at: string;
}

 
export default function AdminBlogList({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (blog: Blog) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    setLoading(blog.id);
    try {
      // Use the server action for secure deletion
      const result = await deleteBlogAction(blog.id, blog.img || null);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete blog');
      }

      setBlogs(blogs.filter(b => b.id !== blog.id));
      router.refresh();
      alert('Blog deleted successfully!');
    } catch (err: any) {
      console.error('Blog deletion error:', err);
      alert(err.message || 'Failed to delete blog');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-card rounded-3xl shadow-lg border border-card-border overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-card-border">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-foreground/40 uppercase tracking-widest">Blog Post</th>
              <th className="px-8 py-5 text-xs font-bold text-foreground/40 uppercase tracking-widest">Author</th>
              <th className="px-8 py-5 text-xs font-bold text-foreground/40 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-xs font-bold text-foreground/40 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-muted/50 transition duration-200 group">
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    <div className="h-12 w-16 bg-muted rounded-lg mr-4 overflow-hidden flex-shrink-0 border border-card-border">
                      {blog.img ? (
                        <img src={blog.img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary-light">{blog.title[0]}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-primary transition duration-200 line-clamp-1">{blog.title}</div>
                      <div className="text-xs text-foreground/40 mt-1">{blog.tags?.join(' • ') || 'No tags'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    <div className="h-7 w-7 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary mr-2">
                      {blog.author_name?.[0] || 'A'}
                    </div>
                    <span className="text-sm font-medium text-foreground/70">{blog.author_name || 'Admin'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-foreground/40">
                  {formatDate(blog.created_at)}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition duration-200">
                    <Link 
                      href={`/blog/${blog.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-primary-light text-primary rounded-xl hover:bg-primary/20 transition-colors font-medium text-sm group"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/admin/edit/${blog.id}`} 
                      className="p-2 text-foreground/40 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDelete(blog)}
                      disabled={loading === blog.id}
                      className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Delete"
                    >
                      {loading === blog.id ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blogs.length === 0 && (
          <div className="p-12 text-center text-foreground/30 font-medium">
            No blog posts available to manage.
          </div>
        )}
      </div>
    </div>

  );
}
