/**
 * Security Configuration
 * Implements defense-in-depth security measures
 */

// Content Security Policy Configuration
const isDevelopment = process.env.NODE_ENV === 'development'

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': isDevelopment ? [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'blob:', // Allow Clerk worker blob URLs
    'https://*',
    'http://localhost:*',
    'https://guiding-arachnid-66.clerk.accounts.dev',
    'https://*.clerk.accounts.dev',
    'https://clerk.accounts.dev',
  ] : [
    "'self'",
    "'unsafe-inline'",
    'blob:', // Allow Clerk worker blob URLs
    'https://clerk.accounts.dev',
    'https://*.clerk.accounts.dev',
    'https://challenges.cloudflare.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.clerk.accounts.dev',
    'https://img.clerk.com',
    'https://images.clerk.dev',
    'https://www.themealdb.com',
    'https://images.unsplash.com',
    'https://source.unsplash.com',
    'https://via.placeholder.com',
    'https://img.spoonacular.com',
    'https://spoonacular.com',
  ],
  'connect-src': isDevelopment ? [
    "'self'",
    'https://*',
    'wss://*',
    'http://localhost:*',
    'https://*.convex.cloud',
    'wss://*.convex.cloud',
    'https://clerk.accounts.dev',
    'https://*.clerk.accounts.dev',
    'https://guiding-arachnid-66.clerk.accounts.dev',
  ] : [
    "'self'",
    'https://*.convex.cloud',
    'wss://*.convex.cloud',
    'https://clerk.accounts.dev',
    'https://*.clerk.accounts.dev',
    'https://www.themealdb.com',
    'https://api.spoonacular.com',
  ],
  'frame-src': [
    "'self'",
    'https://challenges.cloudflare.com',
    'https://accounts.google.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
}

// Generate CSP header string
export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) return directive
      return `${directive} ${values.join(' ')}`
    })
    .join('; ')
}

// Security Headers Configuration
export const SECURITY_HEADERS = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(self), interest-cohort=()',
  },
]

// Rate Limiting Configuration
export const RATE_LIMITS = {
  // API rate limits (requests per minute)
  api: {
    authenticated: 100,
    unauthenticated: 20,
  },
  // Auth rate limits
  auth: {
    login: 5, // attempts per 15 minutes
    register: 3, // attempts per hour
    passwordReset: 3, // attempts per hour
  },
  // Upload limits
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
}

// Input Validation Rules
export const VALIDATION_RULES = {
  // Text input limits
  text: {
    minLength: 1,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s\-.,!?'"()]+$/,
  },
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  },
  // Username rules
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
}

// XSS Protection - Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// SQL Injection Protection - Parameterized queries (example)
export function sanitizeSQLInput(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove common SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .trim()
}

// CSRF Token Generation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

// Session Configuration
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// Encryption Configuration
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltLength: 64,
  iterations: 100000,
}

// Security Monitoring Events
export const SECURITY_EVENTS = {
  AUTH_FAILED: 'auth.failed',
  AUTH_SUCCESS: 'auth.success',
  RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
  SUSPICIOUS_ACTIVITY: 'security.suspicious',
  DATA_BREACH_ATTEMPT: 'security.breach_attempt',
  XSS_ATTEMPT: 'security.xss_attempt',
  SQL_INJECTION_ATTEMPT: 'security.sql_injection',
  CSRF_ATTEMPT: 'security.csrf_attempt',
}

// Security Best Practices Checklist
export const SECURITY_CHECKLIST = {
  authentication: [
    'Use secure session management',
    'Implement MFA where possible',
    'Enforce strong password policies',
    'Use secure password reset flows',
  ],
  authorization: [
    'Implement role-based access control',
    'Verify permissions on every request',
    'Use principle of least privilege',
    'Log all authorization failures',
  ],
  dataProtection: [
    'Encrypt sensitive data at rest',
    'Use HTTPS for all communications',
    'Implement proper key management',
    'Regular security audits',
  ],
  inputValidation: [
    'Validate all user inputs',
    'Use parameterized queries',
    'Implement output encoding',
    'Use allowlists over blocklists',
  ],
  monitoring: [
    'Log security events',
    'Monitor for anomalies',
    'Regular vulnerability scans',
    'Incident response plan',
  ],
}