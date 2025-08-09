"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill email from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_email');
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Persist email when remember is checked
      try {
        if (remember) localStorage.setItem('saved_email', email);
        else localStorage.removeItem('saved_email');
      } catch {}

      toast.success('Login successful');
      const redirect = search.get('redirect') || '/dashboard';
      await new Promise((r) => setTimeout(r, 80));
      if (typeof window !== 'undefined') {
        window.location.assign(redirect);
      } else {
        router.replace(redirect);
        router.refresh();
      }
    } catch (err) {
      const message = err?.message || 'Login error';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#f8f9fb',
        backgroundImage: `
          radial-gradient(1100px 700px at 8% 12%, rgba(99,102,241,0.28), rgba(255,255,255,0) 65%),
          radial-gradient(900px 650px at 92% 15%, rgba(16,185,129,0.22), rgba(255,255,255,0) 62%),
          radial-gradient(1000px 850px at 18% 88%, rgba(59,130,246,0.25), rgba(255,255,255,0) 68%),
          radial-gradient(800px 600px at 82% 85%, rgba(147,51,234,0.18), rgba(255,255,255,0) 60%),
          linear-gradient(135deg, #f8f9fb 0%, #f5f7fa 35%, #f7fafc 70%, #fafbfc 100%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="w-full max-w-md"
      >
        <form
          onSubmit={onSubmit}
          autoComplete="off"
          className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)] transition-transform duration-300 will-change-transform hover:shadow-[0_12px_44px_-12px_rgba(0,0,0,0.28)]"
        >
          {/* Top Accent */}
          <div className="absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-[#0FB3BA] to-[#1976d2]" />

          <div className="p-7 space-y-5">
            {/* Brand */}
            <div className="text-center mb-1">
              <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0FB3BA] to-[#1976d2] text-white grid place-items-center shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">Welcome back</h1>
              <p className="text-sm text-gray-500">Sign in to continue</p>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l4-4m-4 4l4 4M4 6h16v12H4z" />
                  </svg>
                </span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white pl-9 pr-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0FB3BA] focus:border-[#0FB3BA] transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11m6 0v5m6-3a9 9 0 10-18 0 9 9 0 0018 0z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white pl-9 pr-10 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0FB3BA] focus:border-[#0FB3BA] transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 px-2 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.087.384-2.197 1.025-3.2m3.51-2.89A9.963 9.963 0 0112 5c5 0 9 4 9 7 0 1.073-.379 2.171-1.012 3.164M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#0FB3BA] focus:ring-[#0FB3BA]"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <span className="text-gray-400">•</span>
              <a className="text-[#0FB3BA] hover:text-[#0da5b0] hover:underline cursor-pointer" onClick={() => toast.info('Please contact your administrator.')}>Forgot password?</a>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-600 px-3 py-2 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0FB3BA] to-[#1976d2] py-2.5 font-semibold text-white shadow-lg hover:shadow-xl hover:from-[#0da5b0] hover:to-[#1565c0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0FB3BA] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        {/* Small footer */}
        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
