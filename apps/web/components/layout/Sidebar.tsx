'use me';
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
  Gauge,
  Settings,
  UserCheck,
  HelpCircle,
  LogOut,
  Sparkles
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-screen flex flex-col justify-between p-5 select-none font-sans">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-1 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">RETAINLY</h1>
            <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">AI Retention Intelligence</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                {section.title}
              </h2>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-50/80 text-indigo-600 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
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
      <div className="pt-4 border-t border-slate-100">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
