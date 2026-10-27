import React from 'react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-5 w-5 animate-bounce border-2 border-ink bg-primary shadow-[3px_3px_0_var(--ink)]"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Blog<span className="text-primary">App</span>
        </span>
      </div>
    </div>
  );
}
