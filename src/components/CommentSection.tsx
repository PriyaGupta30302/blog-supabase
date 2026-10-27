'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { addCommentAction, deleteCommentAction } from '@/app/actions';
import { isAdmin } from '@/lib/auth-client-utils';
import { useFeedback } from '@/context/FeedbackContext';

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
  const { toast, confirm } = useFeedback();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    setError('');

    // Prepare optimistic comment
    const localNewComment: Comment = {
      id: 'temp-' + Math.random().toString(),
      user_id: user.id,
      user_name: user.fullName || user.username || 'Anonymous',
      content: newComment,
      created_at: new Date().toISOString()
    };

    // Optimistically add to list
    setComments(prev => [localNewComment, ...prev]);
    const originalContent = newComment;
    setNewComment('');

    try {
      const result = await addCommentAction(
        blogId,
        user.id,
        user.fullName || user.username || 'Anonymous',
        originalContent
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save comment');
      }
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      setError(err.message || 'Failed to add comment. Please try again.');
      // Revert optimistic update
      setComments(prev => prev.filter(c => c.id !== localNewComment.id));
      setNewComment(originalContent);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const ok = await confirm({
      title: 'Delete comment?',
      message: 'This comment will be removed for everyone.',
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;

    try {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Comment deleted.');
      } else {
        toast.error('Could not delete the comment.');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
        the chat <span className="ml-1 inline-block -rotate-3 border-2 border-ink bg-accent-2 px-2.5 text-xl text-ink shadow-[3px_3px_0_var(--ink)]">{comments.length}</span>
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border-2 border-red-500">
              {error}
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="drop your thoughts..."
            className="w-full p-4 bg-card border-2 border-ink rounded-2xl shadow-[4px_4px_0_var(--ink)] focus:shadow-[6px_6px_0_var(--primary)] focus:outline-none text-foreground placeholder:text-foreground/40 transition-all min-h-[110px]"
            required
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-full border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? 'Posting...' : 'Send it'}
          </button>
        </form>
      ) : (
        <div className="p-6 bg-muted rounded-2xl text-center border-2 border-dashed border-ink">
          <p className="font-semibold text-foreground/70">Sign in to join the chat ✌️</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-card p-5 sm:p-6 rounded-2xl border-2 border-ink shadow-[3px_3px_0_var(--ink)] group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <span className="mr-3 grid h-8 w-8 min-h-8 min-w-8 shrink-0 aspect-square place-items-center rounded-full border-2 border-ink bg-primary-light text-sm font-extrabold text-foreground">
                  {comment.user_name?.[0]?.toUpperCase() || '?'}
                </span>
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
            <p className="text-foreground/80 whitespace-pre-wrap pl-11">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-foreground/40 py-8">crickets... be the first to say something 🦗</p>
        )}
      </div>
    </div>
  );
}
