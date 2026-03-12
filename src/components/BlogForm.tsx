'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { uploadBlogImage } from '@/lib/storage';
import { convertToWebP } from '@/lib/image-utils';
import { useRouter } from 'next/navigation';
import { archiveBlogImageAction, saveBlogAction, getCategories } from '@/app/actions';
import { isAdmin } from '@/lib/auth-client-utils';
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-2xl flex items-center justify-center text-foreground/20 font-medium">Loading Editor...</div>
});

export default function BlogForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const { user, isLoaded } = useUser();
  const isUserAdmin = isAdmin(user);
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center p-12 bg-card rounded-2xl border border-card-border"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
  }
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.description || initialData?.content || '');
  const [authorName, setAuthorName] = useState(initialData?.author_name || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialData?.img || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    }
    loadCategories();
  }, []);

  const handleContentChange = (data: { html: string }) => {
    setContent(data.html);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isUserAdmin) {
      setError('Unauthorized: Only admins can save blog posts.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalImageUrl = imageUrl;
      
      // If a new image file is selected, upload it
      if (imageFile) {
        // Archive old image if updating
        if (initialData?.img) {
          try {
            await archiveBlogImageAction(initialData.img);
          } catch (archiveError) {
            console.error('Failed to archive old image:', archiveError);
          }
        }
        const webpFile = await convertToWebP(imageFile);
        finalImageUrl = await uploadBlogImage(webpFile);
      }

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      const blogData = {
        title,
        description: content,
        img: finalImageUrl,
        author_name: authorName,
        tags: tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== ''),
        slug: slug,
        category_id: categoryId || null,
        status: status,
      };

      const result = await saveBlogAction(blogData, initialData?.id);

      if (!result.success) throw new Error(result.error);

      if (!initialData) {
        setTitle('');
        setContent('');
        setAuthorName('');
        setTags('');
        setImageFile(null);
      }

      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-card-border transition-colors">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {initialData ? 'Edit Blog' : 'Create New Blog'}
      </h2>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all font-semibold"
            placeholder="A compelling title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">URL Slug (Auto-generated)</label>
          <div className="w-full p-3 bg-muted border border-card-border rounded-xl text-foreground/40 flex items-center overflow-hidden">
            <span className="text-foreground/30 mr-2 shrink-0">/blog/</span>
            <span className="truncate">
              {title
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">Author Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full p-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all"
            placeholder="Your name or pen name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all appearance-none"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">Publishing Status</label>
          <div className="flex bg-muted p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                status === 'draft' ? 'bg-background text-primary shadow-sm' : 'text-foreground/40'
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                status === 'published' ? 'bg-background text-primary shadow-sm' : 'text-foreground/40'
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">Featured Image</label>
          <div className="relative group/img">
            <label className={`block cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 min-h-[160px] relative ${
              (imageUrl || imageFile) ? 'border-primary bg-background' : 'border-card-border bg-background hover:border-primary/50'
            }`}>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              
              {(imageUrl || imageFile) ? (
                <div className="relative w-full h-40">
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-bold text-gray-800 shadow-lg">
                      Change Image
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <svg className="w-10 h-10 text-foreground/30 mb-2 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-foreground/50">
                    Click to upload featured image
                  </span>
                  <span className="text-xs text-foreground/30 mt-1">
                    (PNG, JPG, WebP)
                  </span>
                </div>
              )}
            </label>
            {(imageFile) && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                  NEW
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground/70 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all"
            placeholder="Nextjs, Tech, Lifestyle"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground/70 mb-2">Content</label>
        <div className="border border-card-border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
          <RichTextEditor 
            onContentChange={handleContentChange} 
            initialContent={content}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all transform ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        ) : (
          initialData ? 'Update Blog' : 'Publish Blog Post'
        )}
      </button>
    </form>
  );
}

