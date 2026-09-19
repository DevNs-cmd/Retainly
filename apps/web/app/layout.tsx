import React from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f4f5f8] text-slate-800 antialiased font-sans">{children}</body>
    </html>
  );
}
