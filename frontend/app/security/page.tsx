'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ip: string;
  path: string;
  details?: Record<string, any>;
}

interface SecurityDashboard {
  securityEvents: {
    total: number;
    byType: Record<string, number>;
    recent: SecurityEvent[];
  };
  systemHealth: {
    status: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    activeConnections: number;
  };
  recommendations: string[];
}

export default function SecurityDashboard() {
  const [securityData, setSecurityData] = useState<SecurityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/security/dashboard');
      if (!response.ok) throw new Error('Failed to fetch security data');
      const data = await response.json();
      setSecurityData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchSecurityData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!securityData) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <Button onClick={fetchSecurityData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={securityData.systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}>
                {securityData.systemHealth.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold">
                {Math.floor(securityData.systemHealth.uptime / 3600)}h
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold">
                {Math.round(securityData.systemHealth.memoryUsage.heapUsed / 1024 / 1024)}MB
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold">
                {securityData.systemHealth.activeConnections}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Security Events</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{securityData.securityEvents.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Breakdown of security events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(securityData.securityEvents.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {securityData.securityEvents.recent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent security events</p>
          ) : (
            <div className="space-y-4">
              {securityData.securityEvents.recent.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <span className="font-medium">{event.type}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>IP:</strong> {event.ip}</p>
                    <p><strong>Path:</strong> {event.path}</p>
                    {event.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">Details</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Actions to improve security posture</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {securityData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}