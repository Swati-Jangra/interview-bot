# MongoDB Atlas Security Configuration Guide

This guide walks you through setting up MongoDB Atlas with proper security configurations, including IP whitelisting, for the AI Interview Coach application.

## Prerequisites

- MongoDB Atlas account (free tier available)
- MongoDB Atlas cluster created
- Your application's deployment IP addresses

## Step 1: Access MongoDB Atlas Security Settings

1. Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Select your cluster
3. Click on "Security" in the left sidebar
4. Choose "Network Access" from the dropdown

## Step 2: Configure IP Whitelisting

### Option A: Allow Access from Anywhere (Development Only)

⚠️ **Warning**: This is not recommended for production environments.

1. Click "Add IP Address"
2. Select "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### Option B: Whitelist Specific IP Addresses (Recommended for Production)

1. Click "Add IP Address"
2. Choose "Whitelist a Specific IP Address"
3. Add the following IPs based on your deployment:

#### For Local Development:
```
Your local IP: Find it by visiting https://whatismyipaddress.com
Example: 192.168.1.100
```

#### For Vercel Deployment:
```
Vercel uses dynamic IPs, so you need to whitelist:
- Allow access from anywhere (0.0.0.0/0) for Vercel
- Or use Vercel's IP ranges: https://vercel.com/docs/ips/allowlisting

Vercel IP ranges (example):
- 8.8.8.8/32
- 1.1.1.1/32
```

#### For Railway/Render/DigitalOcean:
```
Add the specific IP addresses of your deployment servers
You can find these in your hosting provider's dashboard
```

### Option C: Use VPC Peering (Enterprise)

For enterprise deployments, consider VPC peering for enhanced security:
1. Set up VPC peering between your cloud provider and MongoDB Atlas
2. Configure private IP ranges
3. Use security groups/firewall rules

## Step 3: Create Database User

1. In MongoDB Atlas, go to "Security" > "Database Access"
2. Click "Add New Database User"
3. Configure the user:

**User Details:**
- **Username**: `ai-interview-coach-user` (or your preferred username)
- **Password**: Generate a strong password (minimum 32 characters)
  - Use: `openssl rand -base64 32` or similar
  - Example: `xK9#mP2$vL8@nQ5&wR3!zD6*sE1+tG4`

**Database User Privileges:**
- **Database**: `ai-interview-coach` (or your database name)
- **Role**: `readWrite` (minimum required)
- **Additional Roles**: None needed for basic functionality

4. Click "Add User"
5. **Important**: Save the username and password securely - you'll need them for your connection string

## Step 4: Get Connection String

1. In MongoDB Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select your Node.js version (should be latest)
4. Copy the connection string

The connection string will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 5: Update Environment Variables

Replace the placeholders in your connection string:

```bash
# Final connection string format
MONGODB_URI=mongodb+srv://ai-interview-coach-user:YourStrongPassword@cluster0.xxxxx.mongodb.net/ai-interview-coach?retryWrites=true&w=majority&ssl=true
```

Add this to your environment files:

### Development (`.env`):
```bash
MONGODB_URI=mongodb+srv://ai-interview-coach-user:YourStrongPassword@cluster0.xxxxx.mongodb.net/ai-interview-coach?retryWrites=true&w=majority
```

### Production (Deployment platform environment variables):
```bash
MONGODB_URI=mongodb+srv://ai-interview-coach-user:YourStrongPassword@cluster0.xxxxx.mongodb.net/ai-interview-coach?retryWrites=true&w=majority&ssl=true
```

## Step 6: Configure Additional Security Settings

### Enable Encryption at Rest

1. Go to "Security" > "Encryption at Rest"
2. Enable customer-managed keys (AWS KMS, Azure Key Vault, or Google Cloud KMS)
3. This provides additional data protection

### Configure Audit Logs

1. Go to "Security" > "Audit Logs"
2. Enable audit logging for compliance and security monitoring
3. Choose what events to log (recommended: all events)

### Set Up Alerts

1. Go to "Alerts" in your cluster settings
2. Configure alerts for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Slow queries (>100ms)
   - Failed authentication attempts
   - Unauthorized access attempts

## Step 7: Test Connection

### Test from Local Development:

```bash
# In your project directory
cd backend
npm run dev
```

If the connection succeeds, you'll see:
```
MongoDB connected successfully with security settings
```

### Test from Production:

Deploy your application and check the logs for successful connection messages.

## Step 8: Monitor and Maintain

### Regular Security Reviews:

1. **Monthly**: Review IP whitelist and remove unused entries
2. **Quarterly**: Rotate database user passwords
3. **Semi-annually**: Review user permissions and remove unnecessary access
4. **Annually**: Complete security audit of Atlas configuration

### Backup Configuration:

1. Go to "Backup" in your cluster settings
2. Configure automated backups:
   - **Retention**: 30 days (or per your requirements)
   - **Frequency**: Daily (recommended)
   - **Snapshot intervals**: Every 6 hours

### Performance Monitoring:

1. Use MongoDB Atlas Metrics Dashboard
2. Monitor:
   - Connection pool usage
   - Query performance
   - Index efficiency
   - Disk I/O operations

## Security Best Practices

### 1. Principle of Least Privilege
- Use readWrite role only if needed
- Consider using read-only for applications that only query data
- Create separate users for different applications

### 2. Network Security
- Always use SSL/TLS connections (enabled by default in Atlas)
- Use IP whitelisting rather than allowing all access
- Consider using VPC peaching for enterprise deployments

### 3. Data Protection
- Enable encryption at rest
- Use field-level encryption for sensitive data
- Implement data masking in application layer

### 4. Access Management
- Use strong, unique passwords
- Enable multi-factor authentication (MFA) for Atlas accounts
- Regularly review and rotate credentials

### 5. Monitoring and Alerting
- Set up comprehensive alerts
- Review audit logs regularly
- Monitor for unusual activity patterns

## Troubleshooting

### Connection Issues:

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check if database user exists and has correct permissions
- Ensure IP whitelist includes your application's IP

**Error: "Connection timeout"**
- Check if IP whitelist is configured correctly
- Verify network connectivity
- Check if cluster is running (not paused)

**Error: "SSL handshake failed"**
- Ensure SSL is enabled in connection string
- Check if your network allows SSL connections
- Verify certificate configuration

### Performance Issues:

**Slow queries:**
- Review query performance in Atlas Metrics
- Add appropriate indexes
- Optimize query patterns

**High memory usage:**
- Check connection pool settings
- Review memory allocation in Atlas
- Optimize application data handling

## Deployment-Specific Configurations

### Vercel Deployment:

```bash
# In Vercel Dashboard > Settings > Environment Variables
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?ssl=true
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

**Note**: Vercel uses dynamic IPs, so you may need to whitelist 0.0.0.0/0 or use Vercel's IP ranges.

### Railway Deployment:

```bash
# In Railway Dashboard > Variables
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?ssl=true
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

### Docker Deployment:

```bash
# In docker-compose.yml or environment file
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?ssl=true
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

## Additional Resources

- [MongoDB Atlas Security Documentation](https://docs.atlas.mongodb.com/security/)
- [IP Whitelisting Best Practices](https://docs.atlas.mongodb.com/security-whitelist/)
- [MongoDB Connection String Guide](https://docs.mongodb.com/manual/reference/connection-string/)
- [Node.js MongoDB Driver Documentation](https://mongodb.github.io/node-mongodb-native/)

## Support

For MongoDB Atlas specific issues:
- MongoDB Atlas Support: https://support.mongodb.com/
- Community Forums: https://community.mongodb.com/

For application-specific issues:
- Check application logs
- Review security event logs
- Consult the SECURITY_GUIDE.md

---

**Last Updated**: 2026-08-06
**Version**: 1.0.0