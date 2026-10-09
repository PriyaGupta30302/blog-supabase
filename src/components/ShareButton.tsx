'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'icon' | 'compact';
}

export default function ShareButton({
  title,
  text = '',
  url,
  className = '',
  variant = 'default',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [instagramToast, setInstagramToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return url || window.location.href;
    }
    return url || '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const copyToClipboard = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
    setOpen(false);
  };

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    const message = encodeURIComponent(`Check out this story: "${title}"\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    setOpen(false);
  };

  const shareToInstagram = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await copyToClipboard();
    setInstagramToast(true);
    setTimeout(() => setInstagramToast(false), 3000);
    window.open('https://instagram.com', '_blank');
    setOpen(false);
  };

  const shareToLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    setOpen(false);
  };

  const shareToTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    const textParam = encodeURIComponent(`Read "${title}" on BlogApp`);
    window.open(`https://twitter.com/intent/tweet?text=${textParam}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    setOpen(false);
  };

  const shareToFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    setOpen(false);
  };

  const shareNativeSystem = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    setOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Native share error:', err);
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'icon' ? (
        <button
          onClick={toggleDropdown}
          title="Share story"
          className={`p-2.5 rounded-full bg-card hover:bg-muted text-foreground/70 hover:text-primary border border-card-border transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center ${className}`}
          aria-label="Share"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      ) : variant === 'compact' ? (
        <button
          onClick={toggleDropdown}
          className={`px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-xs font-semibold text-foreground/70 hover:text-primary border border-card-border transition-all duration-200 shadow-sm flex items-center space-x-1.5 active:scale-95 ${className}`}
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
        </button>
      ) : (
        <button
          onClick={toggleDropdown}
          className={`px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-sm font-semibold text-foreground hover:text-primary border border-card-border shadow-sm transition-all duration-200 flex items-center space-x-2 active:scale-95 ${className}`}
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share Story</span>
          <svg
            className={`w-3.5 h-3.5 text-foreground/40 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Copy Toast Feedbacks */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-primary/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {instagramToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card text-foreground border border-card-border text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Link copied! Paste in Instagram Story or DM</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-card-border rounded-2xl shadow-2xl z-50 p-2 text-sm animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground/40 border-b border-card-border mb-1">
            Share Story via
          </div>

          <div className="space-y-0.5">
            {/* WhatsApp */}
            <button
              onClick={shareToWhatsApp}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left group"
            >
              <span className="w-8 h-8 rounded-lg bg-card-border/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </span>
              <span>WhatsApp</span>
            </button>

            {/* Instagram */}
            <button
              onClick={shareToInstagram}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left group"
            >
              <span className="w-8 h-8 rounded-lg bg-card-border/50 text-pink-600 dark:text-pink-400 flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
              <span>Instagram</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={shareToLinkedIn}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left group"
            >
              <span className="w-8 h-8 rounded-lg bg-card-border/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                </svg>
              </span>
              <span>LinkedIn</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left group"
            >
              <span className="w-8 h-8 rounded-lg bg-card-border/50 text-foreground flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span>X / Twitter</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareToFacebook}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left group"
            >
              <span className="w-8 h-8 rounded-lg bg-card-border/50 text-blue-500 flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <span>Facebook</span>
            </button>

            {/* More Apps (Native System Share) */}
            <button
              onClick={shareNativeSystem}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left group"
            >
              <span className="w-8 h-8 rounded-lg bg-card-border/50 text-foreground/70 flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </span>
              <span>More Apps...</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={(e) => copyToClipboard(e)}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium text-left border-t border-card-border mt-1 pt-2 group"
            >
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
