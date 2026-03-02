'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { uploadBlogImage } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function BlogForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const { user } = useUser();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [authorName, setAuthorName] = useState(initialData?.author_name || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialData?.img || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
      [{ align: [] }],
    ],
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      let finalImageUrl = imageUrl;
      
      // If a new image file is selected, upload it
      if (imageFile) {
        finalImageUrl = await uploadBlogImage(imageFile);
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
      };

      let result;
      if (initialData?.id) {
        // Update existing blog
        result = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', initialData.id);
      } else {
        // Insert new blog
        result = await supabase
          .from('blogs')
          .insert([blogData]);
      }

      if (result.error) throw result.error;

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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? 'Edit Blog' : 'Create New Blog'}
      </h2>
      
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-gray-900 transition-all font-semibold"
            placeholder="A compelling title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug (Auto-generated)</label>
          <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 flex items-center overflow-hidden">
            <span className="text-gray-400 mr-2 shrink-0">/blog/</span>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Author Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-gray-900 transition-all"
            placeholder="Your name or pen name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
          <div className="flex items-center space-x-4">
            <label className="flex-1 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 transition-all">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {imageFile ? imageFile.name : 'Choose image file...'}
                </span>
              </div>
            </label>
            {(imageUrl || imageFile) && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-gray-900 transition-all"
            placeholder="Nextjs, Tech, Lifestyle"
          />
        </div>
      </div>

      <div className="quill-container">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            theme="snow"
            className="bg-white min-h-[300px]"
            placeholder="Write your story here..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all transform ${
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

      <style jsx global>{`
        .quill-container .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb;
          padding: 8px 12px;
        }
        .quill-container .ql-container {
          border: none !important;
          font-family: inherit;
          font-size: 1rem;
        }
        .quill-container .ql-editor {
          min-height: 300px;
          line-height: 1.6;
        }
        .quill-container .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </form>
  );
}
