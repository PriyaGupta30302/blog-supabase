'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const themes = [
  { id: 'blue', name: 'Ocean Blue', color: '#2563eb' },
  { id: 'green', name: 'Forest Green', color: '#10b981' },
  { id: 'rose', name: 'Sweet Rose', color: '#f43f5e' },
  { id: 'violet', name: 'Royal Violet', color: '#8b5cf6' },
  { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
  { id: 'dark', name: 'Midnight', color: '#111827' },
] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl bg-muted/50 hover:bg-muted border border-card-border transition-all duration-300 hover:shadow-md active:scale-95"
        title="Switch Theme"
      >
        <div className="relative">
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-colors duration-500"
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
          <div className="absolute right-0 mt-3 w-64 bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-card-border z-30 py-3 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
            <div className="px-4 pb-3 mb-2 border-b border-card-border/50">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Appearance</span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Choose a Style</h4>
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
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-foreground/60 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 rounded-full border-2 border-card-border shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      theme === t.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    style={{ backgroundColor: t.color }}
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold">{t.name}</span>
                    <span className="text-[10px] opacity-60 font-medium">Click to apply</span>
                  </div>
                  
                  {theme === t.id && (
                    <div className="ml-auto flex items-center group-hover:scale-110 transition-transform">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-3 px-4 pt-3 border-t border-card-border/50 bg-muted/30">
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
