/**
 * Application-wide configuration constants
 */

export const SCAN_CONFIG = {
  /** Interval in milliseconds between poll requests (2 seconds) */
  POLL_INTERVAL: 2000,

  /** Longer timeout for free scans (about 2 minutes) */
  FREE_MAX_POLL_ATTEMPTS: 60,

  /** Maximum number of poll attempts before giving up (about 2 minutes) */
  MAX_POLL_ATTEMPTS: 60,
} as const;

export const API_CONFIG = {
  /** Base URL for API requests (from environment variable) */
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
} as const;
