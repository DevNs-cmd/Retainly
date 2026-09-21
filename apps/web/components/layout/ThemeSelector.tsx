'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
  align?: 'left' | 'right';
}

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ElementType;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
];

export function ThemeSelector({ className = '', align = 'right' }: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = THEME_OPTIONS.find((opt) => opt.value === theme) || THEME_OPTIONS[1];
  const CurrentIcon = currentOption.icon;

  const handleSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left font-sans ${className}`}>
      {/* Collapsed Bar / Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current theme is ${currentOption.label}. Click to choose theme.`}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        style={{
          backgroundColor: isOpen ? 'var(--bg-card-hover)' : 'var(--bg-subtle)',
          borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-card)',
          color: 'var(--text-primary)',
        }}
      >
        <CurrentIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
        <span className="font-semibold">{currentOption.label}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 opacity-60 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
        )}
      </button>

      {/* Expanded Dropdown State */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Theme options"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-44 rounded-2xl border shadow-xl backdrop-blur-xl z-50 p-1.5 space-y-1 transition-all animate-in fade-in zoom-in-95 duration-100`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-400/30 font-bold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
                style={{
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
