'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { addCommentAction, deleteCommentAction } from '@/app/actions';
import { isAdmin } from '@/lib/auth-client-utils';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  blogId: string;
  initialComments: Comment[];
}

export default function CommentSection({ blogId, initialComments }: CommentSectionProps) {
  const { user, isLoaded } = useUser();
  const isUserAdmin = isAdmin(user);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const result = await addCommentAction(
        blogId,
        user.id,
        user.fullName || user.username || 'Anonymous',
        newComment
      );

      if (result.success) {
        setNewComment('');
        // For a better UX, we could refetch or optimistically update
        // Here we'll just add it to the local state for immediate feedback
        const localNewComment: Comment = {
          id: Math.random().toString(), // Temp ID
          user_id: user.id,
          user_name: user.fullName || user.username || 'Anonymous',
          content: newComment,
          created_at: new Date().toISOString()
        };
        setComments([localNewComment, ...comments]);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="mt-16 space-y-8">
      <h3 className="text-2xl font-bold text-foreground">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 bg-background border border-card-border rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all min-h-[100px]"
            required
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="p-6 bg-muted rounded-2xl text-center">
          <p className="text-foreground/60">Please sign in to join the discussion.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-card p-6 rounded-2xl border border-card-border shadow-sm group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-foreground">{comment.user_name}</span>
                <span className="ml-2 text-xs text-foreground/40">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              {isUserAdmin && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-foreground/40 py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}
