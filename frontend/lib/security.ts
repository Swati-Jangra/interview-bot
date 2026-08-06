/**
 * Security utilities for frontend applications
 */

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validates URL to prevent malicious redirects
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is safe for external navigation
 */
export function isSafeUrl(url: string, allowedDomains: string[] = []): boolean {
  if (!isValidUrl(url)) return false;
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Allow same-origin
    if (typeof window !== 'undefined' && hostname === window.location.hostname) {
      return true;
    }
    
    // Check against allowed domains
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Secure localStorage wrapper with error handling
 */
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  },
  
  clear: (): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

/**
 * Secure sessionStorage wrapper
 */
export const secureSessionStorage = {
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
    }
  },
  
  clear: (): void => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }
};

/**
 * Generates a random nonce for CSP
 */
export function generateNonce(): string {
  if (typeof window !== 'undefined') {
    return window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  }
  return Math.random().toString(36).substring(2);
}

/**
 * Rate limiter for API calls
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Content Security Policy nonce generator
 */
let cspNonce: string | null = null;

export function getCspNonce(): string {
  if (!cspNonce) {
    cspNonce = generateNonce();
  }
  return cspNonce;
}

/**
 * Prevents clickjacking by verifying frame context
 */
export function checkFrameContext(): boolean {
  if (typeof window === 'undefined') return true;
  
  try {
    // Check if we're in an iframe
    if (window.self !== window.top) {
      console.warn('Application is running in an iframe');
      return false;
    }
    return true;
  } catch (e) {
    // Access denied - likely in a cross-origin iframe
    console.error('Frame context check failed:', e);
    return false;
  }
}

/**
 * Detects if the application is being inspected
 */
export function detectDevTools(): boolean {
  if (typeof window === 'undefined') return false;
  
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  return widthThreshold || heightThreshold;
}

/**
 * Secure JSON parser with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}