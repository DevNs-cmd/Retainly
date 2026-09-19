'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('alex@retainly.io');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-4 font-sans text-slate-800 antialiased">
      {/* Outer Curved Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Auth Form */}
        <div className="p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight">RETAINLY</h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">AI Retention Intelligence</p>
              </div>
            </div>

            {/* Form Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isSignUp
                  ? 'Start reducing student churn with AI intelligence.'
                  : 'Enter your credentials to access your retention dashboard.'}
              </p>
            </div>

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase">Or with email</span>
            </div>

            {/* Main Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@academy.com"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {!isSignUp && (
                    <Link href="/forgot-password" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-75 mt-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Toggle Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an academy account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-indigo-600 hover:underline inline-block"
            >
              {isSignUp ? 'Sign In' : 'Start 14-Day Free Trial'}
            </button>
          </div>
        </div>

        {/* Right Side: Visual Showcase Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Subtle Glow & Graphic Accents */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold tracking-wide backdrop-blur-md mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Retention Engine v2.4</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight leading-snug">
              Prevent student churn before it happens.
            </h3>
            <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
              Retainly analyzes completion bottlenecks, video drop-offs, and inactivity signals to recover lost course revenue automatically.
            </p>
          </div>

          {/* Social Proof Quote Card */}
          <div className="relative z-10 p-5 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              ★★★★★
            </div>
            <p className="text-xs italic text-indigo-100 leading-relaxed">
              &quot;Retainly helped us decrease student churn by 34% and recover $45k in lost subscription revenue in our first 90 days.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 font-bold text-[10px] flex items-center justify-center text-white">
                SJ
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Sarah Jenkins</p>
                <p className="text-[10px] text-indigo-300">Founder, AI Masterclass Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
