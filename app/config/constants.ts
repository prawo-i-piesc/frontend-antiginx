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

/**
 * The API is reached over same-origin relative paths (`/api/...`); there is
 * deliberately no configurable base URL here.
 *
 * Routing `/api` to the backend is an infrastructure concern: the ingress does
 * it in deployed environments, `rewrites()` in next.config.ts does it locally.
 * Do not reintroduce a `NEXT_PUBLIC_*` base URL — those are inlined into the
 * client bundle at build time and cannot be overridden per environment, which
 * would force one image build per environment.
 */

/** Engine documentation: what every test checks and how it reaches a verdict. */
export const DOCS_URL = 'https://prawo-i-piesc.github.io/engine-antiginx/';

/** The GitHub organization with all of the project's repositories. */
export const GITHUB_URL = 'https://github.com/prawo-i-piesc';

/** Where the Enterprise plan's "Get in touch" button writes to. */
export const CONTACT_EMAIL = 'kontakt@antiginx.pl';
