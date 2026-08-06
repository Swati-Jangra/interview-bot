import { AppError } from "../utils/errors.js";
// Security middleware for advanced protection
/**
 * Prevents parameter pollution by cleaning duplicate parameters
 */
export function preventParameterPollution(req, _res, next) {
    const whitelist = ['filter', 'sort', 'fields', 'page'];
    const queryParams = { ...req.query };
    Object.keys(queryParams).forEach(key => {
        if (!whitelist.includes(key) && queryParams[key] instanceof Array) {
            req.query[key] = queryParams[key][0];
        }
    });
    next();
}
/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(req, _res, next) {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null)
            return obj;
        const sanitized = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Remove potentially dangerous keys
                if (key.startsWith('$') || key.startsWith('_')) {
                    continue;
                }
                const value = obj[key];
                if (typeof value === 'string') {
                    // Basic XSS prevention
                    sanitized[key] = value
                        .replace(/[<>]/g, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+=/gi, '');
                }
                else if (typeof value === 'object') {
                    sanitized[key] = sanitize(value);
                }
                else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    };
    if (req.body)
        req.body = sanitize(req.body);
    if (req.query)
        req.query = sanitize(req.query);
    if (req.params)
        req.params = sanitize(req.params);
    next();
}
/**
 * Validates content type for POST/PUT/PATCH requests
 */
export function validateContentType(req, res, next) {
    const methods = ['POST', 'PUT', 'PATCH'];
    if (methods.includes(req.method) && !req.is('application/json')) {
        throw new AppError(415, 'Content-Type must be application/json', 'INVALID_CONTENT_TYPE');
    }
    next();
}
/**
 * Prevents large payload attacks
 */
export function limitPayloadSize(req, res, next) {
    const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > MAX_PAYLOAD_SIZE) {
        throw new AppError(413, 'Payload too large', 'PAYLOAD_TOO_LARGE');
    }
    next();
}
/**
 * Adds security headers to response
 */
export function addSecurityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
}
/**
 * Validates and sanitizes file uploads
 */
export function validateFileUpload(req, res, next) {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const file = req.file;
    if (file) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new AppError(400, 'Invalid file type. Only PDF and Word documents are allowed.', 'INVALID_FILE_TYPE');
        }
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            throw new AppError(400, 'File size exceeds 5MB limit.', 'FILE_TOO_LARGE');
        }
    }
    next();
}
/**
 * Logs security events (moved to logging.ts)
 */
/**
 * Implements request timeout
 */
export function requestTimeout(timeoutMs) {
    return (req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(504).json({
                    error: 'Request timeout',
                    message: 'The request took too long to process.',
                });
            }
        }, timeoutMs);
        res.on('finish', () => clearTimeout(timeout));
        next();
    };
}
/**
 * Validates user agent to prevent bot attacks
 */
export function validateUserAgent(req, res, next) {
    const userAgent = req.headers['user-agent'];
    if (!userAgent) {
        throw new AppError(400, 'User-Agent header is required', 'MISSING_USER_AGENT');
    }
    // Block common bot user agents
    const blockedAgents = [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
        'python-requests', 'java', 'go-http-client'
    ];
    const lowerAgent = userAgent.toLowerCase();
    if (blockedAgents.some(agent => lowerAgent.includes(agent))) {
        throw new AppError(403, 'Automated requests are not allowed', 'BLOCKED_USER_AGENT');
    }
    next();
}
/**
 * IP whitelist/blacklist middleware
 */
export function filterByIP(whitelist = [], blacklist = []) {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || '';
        // Check blacklist first
        if (blacklist.length > 0 && blacklist.includes(clientIP)) {
            throw new AppError(403, 'Access denied from this IP', 'IP_BLOCKED');
        }
        // Then check whitelist if configured
        if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
            throw new AppError(403, 'Access denied from this IP', 'IP_NOT_ALLOWED');
        }
        next();
    };
}
