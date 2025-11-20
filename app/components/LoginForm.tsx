"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // simulate sending OTP
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setShowOtp(true);
    setOtp('');
    const now = Date.now();
    setOtpSentAt(now);
    setResendCountdown(30); // 30s cooldown
  };

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.trim().length < 4) {
      alert('Please enter the verification code.');
      return;
    }
    setLoading(true);
    // simulate verification
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    // for mock, accept any code that is numeric
    if (/^\d+$/.test(otp.trim())) {
      alert('Verified — logged in');
      // reset form
      setShowOtp(false);
      setEmail('');
      setPassword('');
      setOtp('');
    } else {
      alert('Invalid code');
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setOtpSentAt(Date.now());
    setResendCountdown(30);
    alert('A new verification code was sent (mock).');
  };

  const handleBackToLogin = () => {
    setShowOtp(false);
    setOtp('');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="mx-auto w-16 h-16 relative inline-block">
            <Image src="/logo.png" alt="Antiginx" fill className="object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
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
                  className="mr-3 w-4 h-4 rounded"
                />
                Remember me
              </label>
              <a href="#" className="text-cyan-400 text-sm">Forgot password?</a>
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
