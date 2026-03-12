'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '@/app/actions';

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data || []);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setSubmitting(true);
    setError('');
    const result = await createCategory(newCategory.trim());
    if (result.success) {
      setNewCategory('');
      fetchData();
    } else {
      setError(result.error || 'Failed to add category');
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category? Blogs using this category will remain, but the category tag will be removed.')) return;

    const result = await deleteCategory(id);
    if (result.success) {
      fetchData();
    } else {
      alert(result.error || 'Failed to delete category');
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-card-border p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Manage Categories</h2>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name (e.g. Technology)"
          className="flex-1 bg-background border border-card-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newCategory.trim()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-foreground/60">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-foreground/60 italic">No categories yet. Add your first one above!</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-card-border group">
              <span className="font-medium">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
