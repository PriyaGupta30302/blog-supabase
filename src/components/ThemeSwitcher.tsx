'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const themes = [
  { id: 'blue', name: 'Electric Blue', color: '#3b5bff' },
  { id: 'green', name: 'Mint Fresh', color: '#00b86b' },
  { id: 'rose', name: 'Hot Pink', color: '#ff3d7f' },
  { id: 'violet', name: 'Grape Soda', color: '#8a5cff' },
  { id: 'amber', name: 'Golden Hour', color: '#ffa800' },
  { id: 'dark', name: 'Midnight Lime', color: '#c6ff3d' },
] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sticker-sm group flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-card transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        title="Switch Theme"
      >
        <div className="relative">
          <div 
            className="w-5 h-5 rounded-full border-2 border-ink transition-colors duration-500"
            style={{ backgroundColor: activeTheme?.color }}
          />
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <span className="text-sm font-semibold text-foreground/70 group-hover:text-primary transition-colors hidden sm:inline">
          {activeTheme?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-foreground/40 transition-transform duration-500 ease-out mr-1 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-60'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="sticker absolute right-0 mt-3 w-64 bg-card rounded-2xl z-30 py-3 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
            <div className="px-4 pb-3 mb-2 border-b-2 border-ink/10">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Appearance</span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Pick your vibe</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-1 px-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    theme === t.id 
                      ? 'bg-primary-light text-foreground' 
                      : 'text-foreground/60 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 rounded-full border-2 border-ink shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      theme === t.id ? 'ring-2 ring-offset-2 ring-offset-card ring-ink' : ''
                    }`}
                    style={{ backgroundColor: t.color }}
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold">{t.name}</span>
                    <span className="text-[10px] opacity-60 font-medium">tap to vibe</span>
                  </div>
                  
                  {theme === t.id && (
                    <div className="ml-auto flex items-center group-hover:scale-110 transition-transform">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-3 px-4 pt-3 border-t-2 border-ink/10 bg-muted">
              <p className="text-[10px] text-foreground/40 font-medium leading-tight">
                Your theme preference is automatically saved to your browser.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
