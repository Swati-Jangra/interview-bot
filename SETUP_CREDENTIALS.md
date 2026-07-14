# Environment Setup Credentials

## Local Development

### Backend (.env)
Create `backend/.env` with the following content:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/ai-interview-coach
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long
OPENAI_API_KEY=sk-your-openai-api-key-here
SMTP_FROM=noreply@example.com
```

### Frontend (.env)
Create `frontend/.env` with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws/interview
```

## Deployment Credentials

### Production Backend (.env.production)
```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview-coach
JWT_ACCESS_SECRET=production-super-secret-access-key-min-32-chars-long
JWT_REFRESH_SECRET=production-super-secret-refresh-key-min-32-chars-long
OPENAI_API_KEY=sk-your-production-openai-api-key-here
SMTP_FROM=noreply@your-domain.com
```

### Production Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com/ws/interview
```

## Required Credentials

You need to obtain/provide the following:

1. **MongoDB URI**
   - Local: `mongodb://localhost:27017/ai-interview-coach`
   - Production: Create a MongoDB Atlas account and get your connection string

2. **JWT Secrets**
   - Generate strong random strings (minimum 32 characters)
   - Use different secrets for access and refresh tokens
   - Use different secrets for development and production

3. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Required for AI interview functionality

4. **SMTP Settings** (for email notifications)
   - For local: Can use placeholder
   - For production: Configure with your email service (SendGrid, AWS SES, etc.)

## Quick Setup Commands

```bash
# Generate JWT secrets (optional)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Docker Deployment

If using Docker Compose, update `docker-compose.yml` with your environment variables or use an external `.env` file.
