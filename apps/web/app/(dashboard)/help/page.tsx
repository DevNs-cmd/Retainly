'use client';

import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-xs text-slate-400 mt-0.5">Learn how to maximize student retention and set up automated intervention campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Knowledge Base</h3>
          <p className="text-xs text-slate-400">Step-by-step guides on connecting Kajabi, Stripe, and setting up AI risk models.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">24/7 Priority Support</h3>
          <p className="text-xs text-slate-400">Chat directly with our student retention strategists and customer success engineers.</p>
        </div>
      </div>
    </div>
  );
}
