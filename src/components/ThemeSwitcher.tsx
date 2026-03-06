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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-primary-light transition-colors"
        title="Switch Theme"
      >
        <div 
          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: themes.find(t => t.id === theme)?.color }}
        />
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-xl border border-card-border z-30 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 text-xs font-bold text-foreground/30 uppercase tracking-widest border-b border-card-border mb-2">
              Select Theme
            </div>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                  theme === t.id ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full border border-card-border shadow-sm shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                {t.name}
                {theme === t.id && (
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
