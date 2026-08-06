# Security Configuration Guide

This guide explains the comprehensive security features implemented in the AI Interview Coach application and how to configure them for production deployment.

## Overview

The application implements multiple layers of security to protect against common web vulnerabilities and attacks:

- **Input Validation & Sanitization**: Prevents XSS, SQL injection, and command injection
- **Rate Limiting**: Protects against brute force attacks and API abuse
- **Authentication Security**: Secure password handling, account lockout, token management
- **Request Security**: Content type validation, size limits, timeout protection
- **Security Headers**: CSRF protection, XSS prevention, content security policies
- **CORS Configuration**: Strict cross-origin resource sharing policies
- **Cookie Security**: HTTP-only, secure, same-site cookies
- **Logging & Monitoring**: Security event tracking and anomaly detection

## Security Features

### 1. Enhanced Security Headers

**Location**: `backend/src/middleware/security.ts`

The application uses Helmet.js with custom CSP configuration:

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      // ... more directives
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  // ... additional security headers
})
```

**Benefits**:
- Prevents XSS attacks through Content Security Policy
- Enforces HTTPS with HSTS
- Protects against clickjacking with frameguard
- Prevents MIME type sniffing attacks

### 2. Rate Limiting

**Location**: `backend/src/middleware/security.ts`

Multiple rate limiters for different endpoints:

- **General API**: 300 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes (stricter)
- **Password Reset**: 3 requests per hour
- **Interview Creation**: 10 requests per hour
- **File Uploads**: 5 uploads per hour

**Configuration**:
```typescript
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please try again later.',
    });
  },
});
```

### 3. Input Validation & Sanitization

**Location**: `backend/src/middleware/validate.ts` and `backend/src/middleware/security-advanced.ts`

**Password Validation**:
- Minimum 8 characters, maximum 128 characters
- Requires uppercase, lowercase, numbers, and special characters
- Checks against common passwords
- Prevents password reuse patterns

**Email Validation**:
- Standard email format validation
- Additional checks for length and structure
- Prevents email injection attacks

**Input Sanitization**:
- Removes dangerous characters (`<`, `>`, `javascript:`, `on\w+=`)
- Blocks MongoDB operators (`$`, `_`)
- Prevents parameter pollution
- Truncates excessive input

### 4. Account Security

**Location**: `backend/src/services/auth.service.ts` and `backend/src/models/User.ts`

**Account Lockout**:
- 5 failed login attempts triggers 15-minute lockout
- Automatic reset on successful login
- Failed attempts are tracked in database

**Password Security**:
- Bcrypt hashing with 12 rounds
- Separate hash for refresh tokens
- Secure password reset tokens with expiration
- Password change invalidates existing sessions

**Token Security**:
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (30 days)
- Token rotation on refresh
- Refresh token invalidation on logout

### 5. Request Security

**Location**: `backend/src/middleware/security-advanced.ts`

**Content Type Validation**:
- Only accepts `application/json` for POST/PUT/PATCH
- Prevents content type attacks

**Payload Size Limits**:
- Maximum 10MB payload size
- Prevents denial of service attacks
- Additional limits on file uploads (5MB)

**Request Timeout**:
- 30-second timeout for all requests
- Prevents slowloris attacks
- Frees up resources for legitimate requests

### 6. CORS Configuration

**Location**: `backend/src/middleware/security.ts`

**Strict CORS Policy**:
```typescript
cors({
  origin: function (origin, callback) {
    const allowedOrigins = env.FRONTEND_URL.split(',').map(o => o.trim());
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### 7. Cookie Security

**Location**: `backend/src/middleware/cookies.ts`

**Secure Cookie Configuration**:
```typescript
{
  httpOnly: true,           // Prevents JavaScript access
  secure: true,             // Only sent over HTTPS (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  path: '/',
}
```

### 8. Security Logging & Monitoring

**Location**: `backend/src/middleware/logging.ts`

**Security Event Types**:
- `AUTH_FAILURE`: Failed authentication attempts
- `ACCOUNT_LOCK`: Account lockout events
- `RATE_LIMIT_EXCEEDED`: Rate limit violations
- `SUSPICIOUS_INPUT`: Potential injection attacks
- `INVALID_TOKEN`: Invalid authentication tokens
- `PERMISSION_DENIED`: Authorization failures
- `MALICIOUS_REQUEST`: Detected malicious patterns

**Anomaly Detection**:
- SQL injection pattern detection
- XSS pattern detection
- Path traversal detection
- Command injection detection
- Suspicious IP pattern detection

## Environment Variables

Update your `.env` file with security-related variables:

```bash
# Security
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview-coach

# Authentication
JWT_ACCESS_SECRET=your-very-long-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-different-very-long-random-secret-key-min-32-chars

# Cookie Configuration
COOKIE_DOMAIN=.yourdomain.com

# Rate Limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
```

## Production Deployment Checklist

### 1. Database Security

- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Enable MongoDB Atlas encryption at rest
- [ ] Use strong database credentials
- [ ] Enable MongoDB authentication
- [ ] Configure MongoDB network access
- [ ] Enable MongoDB audit logs

### 2. API Security

- [ ] Set strong JWT secrets (minimum 32 characters)
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set appropriate rate limits
- [ ] Enable security headers
- [ ] Configure cookie security

### 3. Monitoring & Logging

- [ ] Set up external logging (Sentry, DataDog, CloudWatch)
- [ ] Configure security event alerts
- [ ] Enable error tracking
- [ ] Set up uptime monitoring
- [ ] Configure log retention policies

### 4. Network Security

- [ ] Use HTTPS with valid SSL certificate
- [ ] Enable HSTS
- [ ] Configure firewall rules
- [ ] Implement DDoS protection
- [ ] Use CDN for static assets

### 5. Application Security

- [ ] Remove development dependencies
- [ ] Set NODE_ENV=production
- [ ] Enable all security middleware
- [ ] Configure proper error handling
- [ ] Implement request validation
- [ ] Test security headers

## Security Testing

### Manual Testing

1. **Test Rate Limiting**:
   ```bash
   # Send multiple requests quickly
   for i in {1..10}; do curl -X POST http://localhost:4000/api/auth/login; done
   ```

2. **Test Input Validation**:
   ```bash
   # Try malicious input
   curl -X POST http://localhost:4000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"<script>alert(1)</script>","email":"test@test.com","password":"password"}'
   ```

3. **Test CORS**:
   ```bash
   # Try from unauthorized origin
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Origin: http://malicious.com" \
     -H "Content-Type: application/json"
   ```

### Automated Security Testing

Consider using these tools:

- **OWASP ZAP**: Web application security scanner
- **Burp Suite**: Web security testing
- **Snyk**: Dependency vulnerability scanning
- **npm audit**: Node.js security audit
- **Helmet**: Security header testing

## Incident Response

### Security Event Response

1. **Immediate Actions**:
   - Review security logs
   - Identify affected accounts
   - Block malicious IPs
   - Reset compromised credentials

2. **Investigation**:
   - Analyze attack patterns
   - Determine scope of breach
   - Identify root cause
   - Document findings

3. **Recovery**:
   - Patch vulnerabilities
   - Enhance security measures
   - Notify affected users
   - Update security policies

### Security Contacts

- Security Team: security@yourdomain.com
- Emergency Contact: emergency@yourdomain.com
- Incident Response: incident@yourdomain.com

## Compliance

### GDPR Compliance

- [ ] Implement data encryption
- [ ] Enable user data export
- [ ] Implement right to deletion
- [ ] Configure data retention policies
- [ ] Update privacy policy

### SOC 2 Compliance

- [ ] Implement access controls
- [ ] Enable audit logging
- [ ] Configure security monitoring
- [ ] Document security procedures
- [ ] Regular security assessments

## Best Practices

### Development

1. **Never commit secrets** to version control
2. **Use environment variables** for all configuration
3. **Implement least privilege** access
4. **Regular security audits** of dependencies
5. **Keep dependencies updated**

### Operations

1. **Regular security updates** of all components
2. **Monitor security advisories** for dependencies
3. **Test security measures** regularly
4. **Backup and disaster recovery** planning
5. **Incident response planning**

### User Security

1. **Educate users** on security best practices
2. **Encourage strong passwords**
3. **Enable 2FA** (recommended)
4. **Regular security reminders**
5. **Clear security policies**

## Troubleshooting

### Common Security Issues

**Rate Limiting Too Strict**:
```typescript
// Adjust in middleware/security.ts
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500, // Increase from 300
});
```

**CORS Issues**:
```bash
# Check FRONTEND_URL in .env
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
```

**Cookie Issues**:
```bash
# Ensure HTTPS in production
NODE_ENV=production
# Check cookie domain
COOKIE_DOMAIN=.yourdomain.com
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://www.mongodb.com/docs/manual/administration/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support

For security-related questions or to report vulnerabilities:
- Email: security@yourdomain.com
- Documentation: See `/docs/security`
- Issues: GitHub Security Advisories

---

**Last Updated**: 2026-08-06
**Version**: 1.0.0