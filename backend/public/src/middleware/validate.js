import { AppError } from "../utils/errors.js";
export function validate(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
        if (!parsed.success) {
            const errors = parsed.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            throw new AppError(400, JSON.stringify(errors), "VALIDATION_ERROR");
        }
        next();
    };
}
/**
 * Enhanced password validation
 */
export function validatePassword(password) {
    const errors = [];
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
    // Check for common passwords
    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Password is too common');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Email validation with additional checks
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
        return false;
    // Additional checks
    const [localPart, domain] = email.split('@');
    // Check local part length
    if (localPart.length < 1 || localPart.length > 64)
        return false;
    // Check domain length
    if (domain.length < 1 || domain.length > 255)
        return false;
    // Check for consecutive dots
    if (email.includes('..'))
        return false;
    // Check for leading/trailing dots
    if (localPart.startsWith('.') || localPart.endsWith('.'))
        return false;
    return true;
}
/**
 * Sanitize and validate MongoDB ObjectId
 */
export function validateObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}
/**
 * Validate file type and size
 */
export function validateFile(file, allowedTypes, maxSize) {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }
    if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` };
    }
    if (file.size > maxSize) {
        return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
    }
    return { valid: true };
}
/**
 * Sanitize string input
 */
export function sanitizeString(input, maxLength = 1000) {
    if (typeof input !== 'string')
        return '';
    return input
        .trim()
        .substring(0, maxLength)
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
}
/**
 * Validate URL
 */
export function validateUrl(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    }
    catch {
        return false;
    }
}
/**
 * Validate phone number (basic)
 */
export function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s-()]{10,20}$/;
    return phoneRegex.test(phone);
}
