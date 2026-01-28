"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/app/lib/api';
import { useAuth } from '@/app/providers/AuthProvider';

export function useLoginForm() {
  const router = useRouter();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin({ email, password });
      await auth.login(res.token, remember);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSubmit();
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

  return {
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
  };
}

export default useLoginForm;
