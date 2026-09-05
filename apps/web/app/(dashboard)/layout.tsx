import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f5f8] font-sans antialiased text-slate-800">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Fixed Topbar */}
        <Topbar />

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
