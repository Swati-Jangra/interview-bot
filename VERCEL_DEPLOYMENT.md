# Vercel Deployment Guide

## Overview

This guide will help you deploy the AI Interview Coach application to Vercel. Note that due to Vercel's serverless limitations, WebSocket functionality (real-time interview sessions) will need to be handled differently.

## Prerequisites

- Vercel account
- MongoDB Atlas account (for production database)
- OpenAI API key
- Domain name (optional)

## Deployment Steps

### 1. Prepare Environment Variables

Copy `.env.example` to `.env` and update with production values:

```bash
cp .env.example .env
```

Required environment variables for Vercel:

- `NODE_ENV=production`
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` - Generate a secure random string
- `JWT_REFRESH_SECRET` - Generate a different secure random string
- `OPENAI_API_KEY` - Your OpenAI API key
- `SMTP_FROM` - Email address for sending notifications
- `NEXT_PUBLIC_API_URL=/api` - Will be set automatically
- `NEXT_PUBLIC_WS_URL` - Will be set to your Vercel domain

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (or yes if you have one)
- Project name? Enter a name (e.g., `ai-interview-coach`)
- In which directory is your code located? **./**
- Want to modify these settings? **No**

### 4. Configure Environment Variables in Vercel Dashboard

After initial deployment, go to your Vercel project dashboard:

1. Navigate to **Settings** > **Environment Variables**
2. Add the following variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview-coach
JWT_ACCESS_SECRET=your-very-long-random-secret
JWT_REFRESH_SECRET=your-different-very-long-random-secret
OPENAI_API_KEY=sk-proj-...
SMTP_FROM=noreply@yourdomain.com
```

3. Add for frontend (with `NEXT_PUBLIC_` prefix):

```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WS_URL=https://your-app.vercel.app
```

### 5. Redeploy with Environment Variables

```bash
vercel --prod
```

## WebSocket Limitation

**Important**: Vercel serverless functions do not support WebSocket connections. The real-time interview functionality using WebSockets (`/ws/interview`) will not work with this deployment.

### Solutions for WebSocket Support:

#### Option 1: Use a separate WebSocket server
- Deploy the backend separately to a service that supports WebSockets (Railway, Render, AWS EC2)
- Keep the frontend on Vercel
- Update `NEXT_PUBLIC_WS_URL` to point to the WebSocket server

#### Option 2: Use polling as fallback
- Modify the frontend to use HTTP polling instead of WebSockets
- Less ideal for real-time but works with Vercel

#### Option 3: Use Vercel Edge Functions with SSE
- Replace WebSocket with Server-Sent Events (SSE)
- More complex to implement but works on Vercel

## Current Deployment Architecture

- **Frontend**: Next.js deployed to Vercel (automatic)
- **Backend API**: Serverless functions in `/api` directory
- **Database**: MongoDB Atlas (external service)
- **WebSocket**: Not supported (requires alternative solution)

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Environment variables are configured in Vercel dashboard
- [ ] Frontend builds successfully
- [ ] API routes are accessible
- [ ] Authentication flow works
- [ ] Resume upload functionality works
- [ ] WebSocket functionality (requires alternative solution)

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` and `NEXT_PUBLIC_WS_URL` environment variables

## Monitoring

- Vercel provides built-in logs and monitoring
- Check Vercel dashboard for function execution logs
- Monitor MongoDB Atlas for database performance
- Track OpenAI API usage in your OpenAI dashboard

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Ensure Node.js version is >= 20.0.0
- Verify TypeScript compilation succeeds locally

### Runtime Errors
- Check Vercel function logs
- Verify environment variables are set correctly
- Ensure MongoDB Atlas IP whitelist allows Vercel's IPs

### Database Connection Issues
- Verify MongoDB URI format
- Check Atlas cluster is running
- Ensure database user has correct permissions
- Add Vercel's IP ranges to Atlas whitelist

## Production Considerations

1. **Security**: 
   - Use strong JWT secrets
   - Enable HTTPS (automatic on Vercel)
   - Implement rate limiting
   - Add CSRF protection

2. **Performance**:
   - Monitor function execution time
   - Implement caching where appropriate
   - Optimize database queries

3. **Cost**:
   - Vercel free tier has limits
   - MongoDB Atlas has free tier
   - OpenAI API is pay-per-use
   - Monitor usage to avoid unexpected costs

## Alternative Deployment Options

If you need full WebSocket support, consider deploying to:
- **Railway**: Supports WebSockets, easy deployment
- **Render**: Supports WebSockets, free tier available
- **DigitalOcean App Platform**: Full control, supports WebSockets
- **AWS/GCP/Azure**: Enterprise solutions with WebSocket support