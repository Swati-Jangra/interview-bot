import type { Request, Response } from "express";

/**
 * Cookie configuration for security
 */
export const cookieOptions = {
  httpOnly: true, // Prevents client-side JavaScript access
  secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
  sameSite: 'strict' as const, // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

/**
 * Refresh token cookie options (longer expiry)
 */
export const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Sets secure HTTP-only cookies for authentication tokens
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes for access token
  });
  
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
}

/**
 * Clears authentication cookies
 */
export function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', { ...cookieOptions, maxAge: 0 });
  res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
}

/**
 * Extracts tokens from cookies or authorization header
 */
export function extractTokens(req: Request): { accessToken?: string; refreshToken?: string } {
  const accessToken = req.cookies.accessToken || 
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
  
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
  return { accessToken, refreshToken };
}