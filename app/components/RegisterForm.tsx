"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.includes('@')) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!accept) return 'You must accept the terms.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    // simulate registration
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    alert(`Registered: ${email}`);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="mx-auto w-48 h-auto relative inline-block mb-4">
            <Image src="/logotype.png" alt="Antiginx" fill className="object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-zinc-400 text-sm mt-2">Join AntiGinx — create your account to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-6 space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}

          <div>
            <label className="block text-zinc-400 text-sm mb-2">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

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
              placeholder="At least 8 characters"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex items-center mt-2">
            <label className="flex items-center text-sm text-zinc-400">
              <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mr-3 w-4 h-4 rounded" />
              I agree to the terms and privacy policy
            </label>
          </div>

          <div>
            <button type="submit" className="w-full px-3 lg:px-5 py-1 lg:py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <p className="text-center text-zinc-400 text-sm mt-2">Already have an account? <a href="/login" className="text-cyan-400">Sign in</a></p>
        </form>
      </div>
    </div>
  );
}
