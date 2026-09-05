'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, HelpCircle, ChevronDown, Building2 } from 'lucide-react';
import Link from 'next/link';

export function Topbar() {
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
    <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 font-sans">
      {/* Left: Breadcrumb & Search */}
      <div className="flex items-center gap-6">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {getBreadcrumb()}
        </span>
        <div className="relative w-72 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, courses, campaigns..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">Acme Academy</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border border-white"></span>
          </Link>
          <Link
            href="/help"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200"></div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            AK
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Alex Morgan</p>
            <p className="text-[10px] text-slate-400 font-medium">Head of Retention</p>
          </div>
        </div>
      </div>
    </header>
  );
}
