/**
 * Security event types for monitoring
 */
export var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["AUTH_FAILURE"] = "AUTH_FAILURE";
    SecurityEventType["ACCOUNT_LOCK"] = "ACCOUNT_LOCK";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    SecurityEventType["SUSPICIOUS_INPUT"] = "SUSPICIOUS_INPUT";
    SecurityEventType["INVALID_TOKEN"] = "INVALID_TOKEN";
    SecurityEventType["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    SecurityEventType["MALICIOUS_REQUEST"] = "MALICIOUS_REQUEST";
})(SecurityEventType || (SecurityEventType = {}));
/**
 * Security event logger
 */
export function logSecurityEvent(type, details) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type,
        severity: getSeverity(type),
        ...details,
    };
    // In production, send to logging service (e.g., Sentry, DataDog, CloudWatch)
    if (process.env.NODE_ENV === 'production') {
        console.error('SECURITY_EVENT:', JSON.stringify(logEntry));
        // TODO: Integrate with external monitoring service
    }
    else {
        console.warn('Security Event:', logEntry);
    }
}
function getSeverity(type) {
    switch (type) {
        case SecurityEventType.AUTH_FAILURE:
        case SecurityEventType.RATE_LIMIT_EXCEEDED:
            return 'medium';
        case SecurityEventType.ACCOUNT_LOCK:
        case SecurityEventType.PERMISSION_DENIED:
            return 'high';
        case SecurityEventType.MALICIOUS_REQUEST:
            return 'critical';
        default:
            return 'low';
    }
}
/**
 * Request logging middleware with security monitoring
 */
export function securityLogger(req, res, next) {
    const startTime = Date.now();
    const { ip, method, path, headers } = req;
    // Log request details
    const requestLog = {
        timestamp: new Date().toISOString(),
        ip,
        method,
        path,
        userAgent: headers['user-agent'],
        contentType: headers['content-type'],
        contentLength: headers['content-length'],
    };
    // Capture response
    const originalSend = res.send.bind(res);
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const responseLog = {
            ...requestLog,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        };
        // Log potential security issues
        if (res.statusCode >= 400) {
            if (res.statusCode === 401 || res.statusCode === 403) {
                logSecurityEvent(SecurityEventType.AUTH_FAILURE, {
                    ip,
                    path,
                    method,
                    userAgent: headers['user-agent'],
                    additionalInfo: { statusCode: res.statusCode },
                });
            }
            else if (res.statusCode === 429) {
                logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
                    ip,
                    path,
                    method,
                    userAgent: headers['user-agent'],
                });
            }
        }
        // Log all requests in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Request:', responseLog);
        }
        return originalSend(data);
    };
    next();
}
/**
 * Detects suspicious request patterns
 */
export function detectSuspiciousActivity(req, res, next) {
    const suspiciousPatterns = [
        // SQL injection patterns
        /(\bunion\b.*\bselect\b|\bor\b.*1\s*=\s*1|\band\b.*1\s*=\s*1)/i,
        // XSS patterns
        /<script[^>]*>.*<\/script>/i,
        // Path traversal
        /\.\.[\/\\]/,
        // Command injection
        /[;&|`$()]/,
    ];
    const checkString = (str) => {
        if (!str)
            return false;
        return suspiciousPatterns.some(pattern => pattern.test(str));
    };
    // Check various request parts
    const requestBody = JSON.stringify(req.body);
    const queryParams = JSON.stringify(req.query);
    const pathParams = JSON.stringify(req.params);
    if (checkString(requestBody) || checkString(queryParams) || checkString(pathParams)) {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_INPUT, {
            ip: req.ip,
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
            additionalInfo: { body: req.body, query: req.query, params: req.params },
        });
        return res.status(400).json({
            error: 'Invalid request',
            message: 'Your request contains suspicious content and was rejected.',
        });
    }
    next();
}
/**
 * IP-based anomaly detection
 */
export function detectAnomalousIP(req, res, next) {
    // Skip IP detection in development
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    // In production, you would use Redis or a database to track IP patterns
    // This is a simplified version - configure based on your needs
    const suspiciousIPPatterns = [
    // Add known malicious IP ranges here
    // Example: /^192\.168\./, // Private networks (if not expected)
    ];
    if (suspiciousIPPatterns.some(pattern => pattern.test(ip))) {
        logSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, {
            ip,
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
            additionalInfo: { reason: 'Suspicious IP pattern' },
        });
        return res.status(403).json({
            error: 'Access denied',
            message: 'Your IP has been flagged for suspicious activity.',
        });
    }
    next();
}
/**
 * Request size monitoring
 */
export function monitorRequestSize(req, res, next) {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (contentLength > MAX_SIZE) {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_INPUT, {
            ip: req.ip,
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
            additionalInfo: { contentLength, maxSize: MAX_SIZE },
        });
        return res.status(413).json({
            error: 'Payload too large',
            message: 'Request size exceeds maximum allowed limit.',
        });
    }
    next();
}
