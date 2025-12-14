/**
 * Application-wide configuration constants
 */

export const SCAN_CONFIG = {
  /** Interval in milliseconds between poll requests (2 seconds) */
  POLL_INTERVAL: 2000,
  
  /** Maximum number of poll attempts before giving up */
  MAX_POLL_ATTEMPTS: 5,
} as const;

export const API_CONFIG = {
  /** Base URL for API requests (from environment variable) */
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',
} as const;

