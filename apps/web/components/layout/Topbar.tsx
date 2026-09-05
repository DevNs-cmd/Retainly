'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, HelpCircle, ChevronDown, Building2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { UserRole, MOCK_USER_PROFILES } from '../../types/auth';

interface TopbarProps {
  activeRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function Topbar({ activeRole = 'OWNER', onRoleChange }: TopbarProps) {
  const pathname = usePathname();
  const currentProfile = MOCK_USER_PROFILES[activeRole];

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
    <header className="h-16 px-6 md:px-8 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 font-sans">
      {/* Left: Breadcrumb & Search */}
      <div className="flex items-center gap-6">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {getBreadcrumb()}
        </span>
        <div className="relative w-64 lg:w-72 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, courses, campaigns..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right: Role Switcher Dropdown, Org Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Interactive Role Switcher Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wide">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => onRoleChange?.(e.target.value as UserRole)}
            className="bg-transparent text-xs font-extrabold text-indigo-700 focus:outline-none cursor-pointer"
          >
            <option value="OWNER">Owner (Alex Morgan)</option>
            <option value="ADMIN">Admin (Elena Rostova)</option>
            <option value="COACH">Coach (David Miller)</option>
            <option value="STUDENT">Student (Sarah Johnson)</option>
          </select>
        </div>

        {/* Organization Switcher */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
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

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentProfile.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{currentProfile.title}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
