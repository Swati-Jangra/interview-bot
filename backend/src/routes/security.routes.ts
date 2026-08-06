import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { logSecurityEvent, SecurityEventType } from "../middleware/logging.js";

export const securityRouter = Router();

/**
 * Security monitoring endpoint (admin only)
 */
securityRouter.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  try {
    // This would typically query a database or logging service
    const securityData = {
      securityEvents: {
        total: 0,
        byType: {
          [SecurityEventType.AUTH_FAILURE]: 0,
          [SecurityEventType.ACCOUNT_LOCK]: 0,
          [SecurityEventType.RATE_LIMIT_EXCEEDED]: 0,
          [SecurityEventType.SUSPICIOUS_INPUT]: 0,
          [SecurityEventType.INVALID_TOKEN]: 0,
          [SecurityEventType.PERMISSION_DENIED]: 0,
          [SecurityEventType.MALICIOUS_REQUEST]: 0,
        },
        recent: [],
      },
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        activeConnections: 0,
      },
      recommendations: [
        'Enable external logging service for production',
        'Configure IP whitelisting for database access',
        'Set up automated security scanning',
        'Implement regular security audits',
      ],
    };

    res.json(securityData);
  } catch (error) {
    logSecurityEvent(SecurityEventType.PERMISSION_DENIED, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
      additionalInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    res.status(500).json({ error: 'Failed to fetch security data' });
  }
});

/**
 * Log security event endpoint (for frontend reporting)
 */
securityRouter.post("/log-event", requireAuth, async (req, res) => {
  try {
    const { type, details } = req.body;
    
    const validTypes = Object.values(SecurityEventType);
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid security event type' });
    }

    logSecurityEvent(type as SecurityEventType, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
      ...details,
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to log security event' });
  }
});

/**
 * Get security recommendations (admin only)
 */
securityRouter.get("/recommendations", requireAuth, requireAdmin, async (req, res) => {
  const recommendations = [
    {
      category: 'Authentication',
      priority: 'high',
      recommendation: 'Enable two-factor authentication',
      status: 'pending',
    },
    {
      category: 'Network Security',
      priority: 'high',
      recommendation: 'Configure IP whitelisting for API access',
      status: 'pending',
    },
    {
      category: 'Data Protection',
      priority: 'medium',
      recommendation: 'Enable field-level encryption for sensitive data',
      status: 'pending',
    },
    {
      category: 'Monitoring',
      priority: 'high',
      recommendation: 'Integrate with external security monitoring service',
      status: 'pending',
    },
    {
      category: 'Compliance',
      priority: 'medium',
      recommendation: 'Implement GDPR compliance measures',
      status: 'pending',
    },
  ];

  res.json(recommendations);
});

/**
 * Security audit log endpoint (admin only)
 */
securityRouter.get("/audit-log", requireAuth, requireAdmin, async (req, res) => {
  try {
    // This would typically query a database for audit logs
    const auditLogs = {
      logs: [],
      summary: {
        total: 0,
        byType: {},
        byUser: {},
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      },
    };

    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});