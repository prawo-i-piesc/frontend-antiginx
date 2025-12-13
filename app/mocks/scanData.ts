import { ScanResponse } from '@/app/lib/api';

export const mockScanWithResults: ScanResponse = {
  id: "999",
  target_url: 'https://example-test.com',
  status: 'COMPLETED',
  created_at: new Date().toISOString(),
  started_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  results: [
    {
      id: 1,
      scan_id: "999",
      test_id: "ssl-cert-001",
      test_name: 'SSL Certificate Validation',
      category: 'security',
      message: 'The SSL certificate is valid and properly configured.',
      severity: 'INFO',
      passed: true,
      reference: 'https://example.com/docs/ssl',
      remediation: 'No action required.'
    },
    {
      id: 2,
      scan_id: "999",
      test_id: "malware-002",
      test_name: 'Malware Detection',
      category: 'security',
      message: 'Critical malware detected in multiple JavaScript files. Immediate action required!',
      severity: 'CRITICAL',
      passed: false,
      reference: 'https://example.com/docs/malware',
      remediation: 'Remove infected files immediately and scan all systems.'
    },
    {
      id: 3,
      scan_id: "999",
      test_id: "phishing-003",
      test_name: 'Phishing Detection',
      category: 'security',
      message: 'High probability of phishing attempt detected based on content analysis.',
      severity: 'HIGH',
      passed: false,
      reference: 'https://example.com/docs/phishing',
      remediation: 'Review site content and verify legitimacy.'
    },
    {
      id: 4,
      scan_id: "999",
      test_id: "headers-004",
      test_name: 'Security Headers',
      category: 'configuration',
      message: 'Missing Content-Security-Policy header. This may expose users to XSS attacks.',
      severity: 'MEDIUM',
      passed: false,
      reference: 'https://example.com/docs/csp',
      remediation: 'Add CSP header to your web server configuration.'
    },
    {
      id: 5,
      scan_id: "999",
      test_id: "cookies-005",
      test_name: 'Cookie Security',
      category: 'configuration',
      message: 'Some cookies are missing the Secure flag.',
      severity: 'LOW',
      passed: false,
      reference: 'https://example.com/docs/cookies',
      remediation: 'Add Secure flag to all cookies in production.'
    },
    {
      id: 6,
      scan_id: "999",
      test_id: "https-006",
      test_name: 'HTTPS Redirect',
      category: 'security',
      message: 'Site properly redirects HTTP to HTTPS.',
      severity: 'INFO',
      passed: true,
      reference: 'https://example.com/docs/https',
      remediation: 'No action required.'
    }
  ]
};

export const mockScanInProgress: ScanResponse = {
  id: "998",
  target_url: 'https://scanning-in-progress.com',
  status: 'RUNNING',
  created_at: new Date().toISOString(),
  started_at: new Date().toISOString(),
  completed_at: null,
  results: []
};

export const mockScanError = 'Failed to connect to the server. Please check your internet connection and try again.';
