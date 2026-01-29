"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    remember,
    setRemember,
    loading,
    showOtp,
    setShowOtp,
    otp,
    setOtp,
    otpSentAt,
    resendCountdown,
    error,
    handleSubmit,
    handleVerifyOtp,
    handleResend,
    handleBackToLogin,
  } = (function lazyHook() {
    // lazy require to avoid circular imports in module scope
    const m = require('@/app/hooks/useLoginForm');
    return m.useLoginForm();
  })();


  // handlers are provided by useLoginForm

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="mx-auto w-48 h-16 relative inline-block mb-0">
            <Image src="/logotype.png" alt="Antiginx" fill className="object-contain" />
          </Link>
          <p className="text-zinc-400 text-sm mt-2">Welcome back! Enter your login details.</p>
        </div>

        {!showOtp ? (
          <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="mr-2 w-4 h-4 rounded-sm bg-zinc-800/60 border border-zinc-700 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 peer-checked:[&>svg]:block flex items-center justify-center">
                  <svg className="hidden w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Remember me
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-500 text-sm">Forgot password?</a>
            </div>

            <div>
              <button
                type="submit"
                className="w-full px-3 lg:px-5 py-1 lg:py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800/60" />
              <div className="text-zinc-400 text-sm">or</div>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>

            <div className="space-y-3">
              <button type="button" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 text-sm text-zinc-200 flex items-center justify-center gap-3">
                <i className="ri-google-line" /> Continue with Google
              </button>
              <button type="button" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 text-sm text-zinc-200 flex items-center justify-center gap-3">
                <i className="ri-github-line" /> Continue with GitHub
              </button>
            </div>

            <p className="text-center text-zinc-400 text-sm mt-2">Don't have an account? <a href="/register" className="text-cyan-400">Sign up</a></p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-6 space-y-4">
            <div className="text-center">
              <p className="text-zinc-300">A verification code was sent to <span className="font-medium text-white">{email}</span></p>
              <p className="text-zinc-400 text-sm mt-1">Enter the 6-digit code below to continue.</p>
            </div>

            <div className="flex justify-center">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="------"
                className="w-48 text-center tracking-widest text-xl bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={handleBackToLogin} className="text-zinc-400 text-sm">Back</button>
              <div className="text-sm text-zinc-400">{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : <button type="button" onClick={handleResend} className="text-cyan-400">Resend</button>}</div>
            </div>

            <div>
              <button type="submit" className="w-full px-3 lg:px-5 py-1 lg:py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
