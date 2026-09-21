'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BookOpen,
  Send,
  Zap,
  BarChart3,
  CheckSquare,
  Bell,
  Blocks,
  CreditCard,
  Settings,
  UserCheck,
  HelpCircle,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Students', href: '/students', icon: Users },
      { label: 'Risk & Churn', href: '/risk', icon: AlertTriangle, badge: 'AI' },
      { label: 'Courses', href: '/courses', icon: BookOpen },
      { label: 'Campaigns', href: '/campaigns', icon: Send },
      { label: 'Automation', href: '/automation', icon: Zap },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Coach Tasks', href: '/tasks', icon: CheckSquare, badge: '3' },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Integrations', href: '/integrations', icon: Blocks },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { label: 'Billing', href: '/billing', icon: CreditCard },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Team & Members', href: '/team', icon: UserCheck },
      { label: 'Help & Support', href: '/help', icon: HelpCircle },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 z-50 flex flex-col justify-between p-5 select-none font-sans transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 bg-[#162330]/95 dark:bg-[#162330]/95 light:bg-white border-r border-white/10 dark:border-white/10 light:border-slate-200 overflow-y-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                  RETAINLY
                </h1>
                <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  AI Retention Intelligence
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="px-3 text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  {section.title}
                </h2>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onClose?.()}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-amber-400/15 text-amber-500 dark:text-amber-400 font-semibold border border-amber-400/20 shadow-xs'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-amber-400 text-slate-950 font-bold'
                                : 'bg-black/10 dark:bg-white/10 opacity-90'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Footer */}
        <div className="pt-4 mt-6 border-t border-white/10 dark:border-white/10 light:border-slate-200">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
