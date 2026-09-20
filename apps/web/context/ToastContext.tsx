'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    showToast(title, description, 'success');
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast(title, description, 'error');
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast(title, description, 'info');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      {/* Floating Toasts Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 bg-[#1c2c3b]/95 border-white/10 text-white dark:bg-[#1c2c3b]/95 dark:border-white/10 dark:text-white light:bg-white light:border-slate-200 light:text-slate-900"
              style={{
                backgroundColor: 'var(--toast-bg)',
                borderColor: 'var(--toast-border)',
                color: 'var(--toast-text)',
              }}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-amber-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-snug">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 p-1 opacity-60 hover:opacity-100 rounded-lg transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
