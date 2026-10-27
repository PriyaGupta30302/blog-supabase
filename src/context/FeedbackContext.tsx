'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
}

interface FeedbackContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  /** Resolves true if the user confirms, false if they cancel / dismiss. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const KIND_STYLES: Record<ToastKind, { badge: string; icon: string }> = {
  success: { badge: 'bg-primary text-primary-foreground', icon: '✓' },
  error: { badge: 'bg-red-500 text-white', icon: '!' },
  info: { badge: 'bg-accent-2 text-ink', icon: 'i' },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const style = KIND_STYLES[item.kind];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(el.current, { y: 30, opacity: 0, scale: 0.9, rotation: 2, duration: 0.5, ease: 'back.out(2)' });
    },
    { scope: el }
  );

  useEffect(() => {
    const timer = setTimeout(() => onClose(item.id), item.kind === 'error' ? 6000 : 4000);
    return () => clearTimeout(timer);
  }, [item, onClose]);

  return (
    <div
      ref={el}
      role={item.kind === 'error' ? 'alert' : 'status'}
      onClick={() => onClose(item.id)}
      className="pointer-events-auto flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-ink bg-card px-4 py-3 shadow-[4px_4px_0_var(--ink)]"
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink text-sm font-extrabold ${style.badge}`}>
        {style.icon}
      </span>
      <p className="text-sm font-semibold text-foreground">{item.message}</p>
    </div>
  );
}

function ConfirmDialog({
  options,
  onResult,
}: {
  options: ConfirmOptions;
  onResult: (value: boolean) => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const cancelBtn = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(card.current, { scale: 0.85, y: 20, rotation: -2, opacity: 0, duration: 0.45, ease: 'back.out(2)' });
    },
    { scope: card }
  );

  useEffect(() => {
    cancelBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResult(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onResult]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={() => onResult(false)}
    >
      <div
        ref={card}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border-2 border-ink bg-card p-6 shadow-[8px_8px_0_var(--ink)] sm:p-8"
      >
        <h2 id="confirm-title" className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          {options.title ?? 'Are you sure?'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">{options.message}</p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelBtn}
            type="button"
            onClick={() => onResult(false)}
            className="rounded-full border-2 border-ink bg-card px-6 py-2.5 font-bold text-foreground shadow-[3px_3px_0_var(--ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {options.cancelText ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => onResult(true)}
            className={`rounded-full border-2 border-ink px-6 py-2.5 font-bold shadow-[3px_3px_0_var(--ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              options.danger ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
            }`}
          >
            {options.confirmText ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      // A second confirm replaces the first, which counts as a cancel.
      resolver.current?.(false);
      resolver.current = resolve;
      setDialog(options);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setDialog(null);
  }, []);

  const value = useMemo<FeedbackContextType>(
    () => ({
      toast: {
        success: (m) => push('success', m),
        error: (m) => push('error', m),
        info: (m) => push('info', m),
      },
      confirm,
    }),
    [push, confirm]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[95] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={dismiss} />
        ))}
      </div>
      {dialog && <ConfirmDialog options={dialog} onResult={settle} />}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
