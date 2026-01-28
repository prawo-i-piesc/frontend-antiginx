// API configuration and types based on backend specification

import { API_CONFIG } from '@/app/config/constants';

const BACKEND_URL = API_CONFIG.BACKEND_URL;

// Types based on backend response structure
export type ScanStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'RUNNING';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ScanResultItem {
  id: number;
  scan_id: string;
  test_id: string;
  test_name: string;
  category: string;
  severity: SeverityLevel;
  passed: boolean;
  message: string;
  reference: string;
  remediation: string;
}

export interface ScanResponse {
  id: string;
  target_url: string;
  status: ScanStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  results: ScanResultItem[];
}

export interface CreateScanRequest {
  target_url: string;
}

export interface CreateScanResponse {
  scanId: string;
  status: ScanStatus;
}

// API functions
export async function createScan(targetUrl: string): Promise<CreateScanResponse> {
  const response = await fetch(`${BACKEND_URL}/api/scans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_url: targetUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create scan' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getScan(scanId: string): Promise<ScanResponse> {
  const response = await fetch(`${BACKEND_URL}/api/scans/${scanId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Polling function to wait for scan completion
export async function pollScanUntilComplete(
  scanId: string,
  onProgress?: (scan: ScanResponse) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000,
  shouldAbort?: () => boolean
): Promise<ScanResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Check if polling should be aborted
    if (shouldAbort && shouldAbort()) {
      const scan = await getScan(scanId);
      return scan; // Return current state and stop polling
    }

    const scan = await getScan(scanId);
    
    if (onProgress) {
      onProgress(scan);
    }

    if (scan.status === 'COMPLETED' || scan.status === 'FAILED') {
      return scan;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Scan timeout: Maximum polling attempts reached');
}

// Helper functions for UI
export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'CRITICAL':
      return 'text-red-500';
    case 'HIGH':
      return 'text-red-400';
    case 'MEDIUM':
      return 'text-orange-400';
    case 'LOW':
      return 'text-yellow-400';
    case 'INFO':
      return 'text-blue-400';
    default:
      return 'text-zinc-400';
  }
}

export function getSeverityBgColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-900/30 border-red-600/50';
    case 'HIGH':
      return 'bg-red-900/20 border-red-600/30';
    case 'MEDIUM':
      return 'bg-orange-900/20 border-orange-600/30';
    case 'LOW':
      return 'bg-yellow-900/20 border-yellow-600/30';
    case 'INFO':
      return 'bg-blue-900/20 border-blue-600/30';
    default:
      return 'bg-zinc-800/50 border-zinc-700/50';
  }
}

export function calculateThreatLevel(results: ScanResultItem[]): number {
  if (results.length === 0) return 0;

  const severityWeights: Record<SeverityLevel, number> = {
    CRITICAL: 100,
    HIGH: 75,
    MEDIUM: 50,
    LOW: 25,
    INFO: 5,
  };

  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length === 0) return 0;

  const totalWeight = failedTests.reduce((sum, result) => {
    return sum + severityWeights[result.severity];
  }, 0);

  // Calculate weighted average and cap at 100
  const avgWeight = totalWeight / failedTests.length;
  return Math.min(Math.round(avgWeight), 100);
}

export function getStatusColor(status: ScanStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-400';
    case 'FAILED':
      return 'text-red-400';
    case 'RUNNING':
      return 'text-yellow-400';
    case 'PENDING':
      return 'text-blue-400';
    default:
      return 'text-zinc-400';
  }
}

// ----------------------
// Authentication API
// ----------------------

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_in: number;
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface MeResponse {
  id: string;
  email: string;
  full_name: string;
}

export async function getMe(token: string): Promise<MeResponse> {
  if (!BACKEND_URL) throw new Error('BACKEND_URL not configured');
  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch user' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return res.json();
}
