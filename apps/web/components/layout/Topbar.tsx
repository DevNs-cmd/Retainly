'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, HelpCircle, ChevronDown, Building2, Menu } from 'lucide-react';
import Link from 'next/link';
import { ThemeSelector } from './ThemeSelector';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const pathname = usePathname();

  // Generate breadcrumb from pathname
  const getBreadcrumb = () => {
    if (!pathname || pathname === '/' || pathname === '/dashboard') {
      return 'Analytics / Dashboard';
    }
    const parts = pathname.split('/').filter(Boolean);
    const formatted = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    return `Analytics / ${formatted}`;
  };

  return (
    <header
      className="h-16 px-4 md:px-8 border-b flex items-center justify-between shrink-0 font-sans z-20 sticky top-0 backdrop-blur-xl transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      {/* Left: Mobile Toggle, Breadcrumb & Search */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="hidden sm:inline-block text-xs font-semibold tracking-wide uppercase opacity-70" style={{ color: 'var(--text-muted)' }}>
          {getBreadcrumb()}
        </span>

        <div className="relative w-48 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search directory..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all border"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-input)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Right: Theme Selector, Controls & User Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Unified Single Expandable Theme Control */}
        <ThemeSelector />

        {/* Organization Switcher */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 border rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-card)',
          }}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Acme Academy
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label="View notifications"
            className="w-8 h-8 rounded-xl flex items-center justify-center border hover:opacity-90 relative transition-all"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5"></span>
          </Link>
          <Link
            href="/help"
            aria-label="Help & documentation"
            className="w-8 h-8 rounded-xl flex items-center justify-center border hover:opacity-90 transition-all"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
          >
            <HelpCircle className="w-4 h-4" />
          </Link>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            AK
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Alex Morgan
            </p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Head of Retention
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
