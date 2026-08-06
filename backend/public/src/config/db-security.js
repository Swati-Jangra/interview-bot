/**
 * Database Security Configuration
 *
 * This file contains security configurations for MongoDB connections
 * and database-level security measures.
 */
import mongoose from "mongoose";
/**
 * Database connection security options
 */
export const dbSecurityOptions = {
    // SSL/TLS Configuration
    ssl: process.env.NODE_ENV === 'production',
    sslValidate: process.env.NODE_ENV === 'production',
    // Connection Pool Settings
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2'),
    // Timeout Settings
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
    // Retry Settings
    retryWrites: true,
    retryReads: true,
    // Monitoring
    heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY || '10000'),
    // Compression
    compressors: ['zlib'],
};
/**
 * MongoDB security best practices
 */
export function configureMongoDBSecurity() {
    // Enable strict mode to prevent silent schema changes
    mongoose.set('strictQuery', true);
    // Enable query logging in development
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }
}
/**
 * Database index security recommendations
 */
export const dbIndexRecommendations = {
    // Always index fields used in queries
    requiredIndexes: [
        'email', // User authentication
        'verificationToken', // Email verification
        'passwordResetToken', // Password reset
        'lockUntil', // Account lockout
        'createdAt', // Timestamp queries
    ],
    // Compound indexes for common query patterns
    compoundIndexes: [
        { fields: { email: 1, isEmailVerified: 1 } },
        { fields: { passwordResetToken: 1, passwordResetExpires: 1 } },
    ],
    // TTL indexes for automatic cleanup
    ttlIndexes: [
        { collection: 'users', field: 'passwordResetExpires', ttlSeconds: 0 },
        { collection: 'users', field: 'lockUntil', ttlSeconds: 0 },
    ],
};
/**
 * Database backup and recovery recommendations
 */
export const dbBackupRecommendations = {
    // Backup frequency
    backupFrequency: 'daily',
    // Backup retention
    retentionPeriod: '30 days',
    // Backup locations
    backupLocations: [
        'Primary cloud storage',
        'Secondary cloud storage (different region)',
        'On-premises backup (if applicable)',
    ],
    // Backup encryption
    encryption: 'AES-256',
    // Backup validation
    validationFrequency: 'weekly',
};
/**
 * Database monitoring metrics
 */
export const dbMonitoringMetrics = [
    'Connection pool usage',
    'Query execution time',
    'Index usage statistics',
    'Memory usage',
    'Disk I/O',
    'Network latency',
    'Error rates',
    'Slow query logs',
];
/**
 * Database security checklist
 */
export const dbSecurityChecklist = {
    connection: [
        'SSL/TLS enabled in production',
        'Strong database credentials',
        'IP whitelisting configured',
        'Network isolation enabled',
        'Authentication enabled',
    ],
    data: [
        'Encryption at rest enabled',
        'Field-level encryption for sensitive data',
        'Data masking for PII',
        'Regular backups configured',
        'Backup encryption enabled',
    ],
    access: [
        'Principle of least privilege',
        'Role-based access control',
        'Regular access reviews',
        'Audit logging enabled',
        'Activity monitoring configured',
    ],
    compliance: [
        'GDPR compliance measures',
        'Data retention policies',
        'Right to deletion implementation',
        'Data export functionality',
        'Privacy policy compliance',
    ],
};
/**
 * Implement database security measures
 */
export async function implementDatabaseSecurity() {
    configureMongoDBSecurity();
    // Log security configuration
    console.log('Database security configured:', {
        ssl: dbSecurityOptions.ssl,
        maxPoolSize: dbSecurityOptions.maxPoolSize,
        retryWrites: dbSecurityOptions.retryWrites,
    });
}
