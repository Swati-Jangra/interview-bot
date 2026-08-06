# Frontend-Backend API Connection Guide

यह guide बताती है कि कैसे frontend backend APIs के साथ connect है और properly configure करें।

## 📋 Current Configuration

### 1. API Service File (`frontend/services/api.ts`)

Frontend में API service file है जो सभी backend APIs को call करती है:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
```

### 2. Available APIs

#### Authentication APIs:
- `api.signup()` - User registration
- `api.login()` - User login
- `api.refresh()` - Token refresh
- `api.verifyEmail()` - Email verification
- `api.forgotPassword()` - Password reset request
- `api.resetPassword()` - Password reset confirmation

#### Interview APIs:
- `api.dashboard()` - Get user dashboard data
- `api.createInterview()` - Create new interview
- `api.getInterview()` - Get interview details
- `api.startInterview()` - Start interview session
- `api.submitAnswer()` - Submit interview answer
- `api.completeInterview()` - Complete interview
- `api.listInterviews()` - List all interviews

#### Resume APIs:
- `api.getResume()` - Get user resume data
- `api.uploadResume()` - Upload resume file

#### Voice APIs:
- `api.transcribe()` - Transcribe audio to text
- `api.textToSpeech()` - Convert text to speech

## 🔧 Configuration Steps

### Development Environment के लिए:

1. **Backend चलाएं**:
```bash
cd "/Users/jangra/Documents/work /interview ai tool/backend"
npm run dev
```
Backend `http://localhost:4000` पर चलेगा।

2. **Frontend environment variables सेट करें**:
```bash
cd "/Users/jangra/Documents/work /interview ai tool/frontend"
cp .env.example .env.local
```

`.env.local` file में:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws/interview
```

3. **Frontend चलाएं**:
```bash
npm run dev
```
Frontend `http://localhost:3000` पर चलेगा।

### Production (Vercel) के लिए:

1. **Environment variables सेट करें**:
Vercel Dashboard में:
```bash
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app
```

2. **Backend को deploy करें**:
- या तो separate server पर deploy करें (Railway, Render, etc.)
- या फिर Vercel serverless functions का use करें

## 🌐 API Connection Flow

### 1. Authentication Flow:

```
Frontend → POST /api/auth/signup → Backend
Frontend → POST /api/auth/login → Backend → Returns JWT tokens
Frontend → Stores tokens in auth store
Frontend → Uses Bearer token for subsequent requests
```

### 2. Interview Flow:

```
Frontend → POST /api/interviews → Backend → Creates interview
Frontend → POST /api/interviews/:id/start → Backend → Starts session
Frontend → WebSocket connection → Real-time communication
Frontend → POST /api/interviews/:id/complete → Backend → Completes interview
```

### 3. File Upload Flow:

```
Frontend → FormData with file → POST /api/resume → Backend
Backend → Validates and processes file → Returns success
```

## 🔒 Security Features

### 1. JWT Authentication:
- Access token (15 minutes expiry)
- Refresh token (30 days expiry)
- Automatic token refresh
- Secure storage in auth store

### 2. Request Headers:
```typescript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
}
```

### 3. Error Handling:
```typescript
if (!response.ok) {
  const body = await response.json();
  throw new Error(body.error?.message ?? "Request failed");
}
```

## 🧪 Testing API Connection

### 1. Test Backend Health:
```bash
curl http://localhost:4000/api/health
```

### 2. Test Authentication:
```bash
# Signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

### 3. Test Protected Routes:
```bash
curl http://localhost:4000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Environment Variables Reference

### Development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws/interview
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel):
```bash
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Production (Separate Backend):
```bash
NEXT_PUBLIC_API_URL=https://your-backend.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend.com/ws/interview
NEXT_PUBLIC_APP_URL=https://your-frontend.com
```

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors:
**Problem**: Frontend cannot connect to backend
**Solution**: 
- Backend में CORS middleware check करें
- Frontend URL को backend CORS में add करें

### Issue 2: Network Errors:
**Problem**: API calls failing
**Solution**:
- Backend running है या check करें
- Environment variables correct हैं या verify करें
- Network connectivity check करें

### Issue 3: Authentication Errors:
**Problem**: 401 Unauthorized errors
**Solution**:
- Token store में token है या check करें
- Token expired नहीं है या verify करें
- Refresh token mechanism working है या check करें

### Issue 4: WebSocket Connection Issues:
**Problem**: WebSocket not connecting
**Solution**:
- WebSocket URL correct है या check करें
- Token valid है या verify करें
- Backend WebSocket server running है या check करें

## 🔄 Token Refresh Flow

Frontend automatically handles token refresh:

```typescript
// When API call fails with 401
try {
  return await apiFetch("/protected-route");
} catch (error) {
  // Try to refresh token
  const newTokens = await api.refresh({ refreshToken });
  // Update auth store
  // Retry original request
}
```

## 📊 Monitoring API Calls

### Add Logging:
```typescript
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  console.log(`API Call: ${API_URL}${path}`, options);
  
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  console.log(`API Response: ${response.status}`, response);
  
  // ... rest of the function
}
```

## 🎯 Best Practices

1. **Always use environment variables** for API URLs
2. **Handle errors gracefully** in frontend
3. **Show loading states** during API calls
4. **Validate responses** before using data
5. **Implement retry logic** for failed requests
6. **Use WebSocket** for real-time features
7. **Secure sensitive data** with proper auth
8. **Monitor API performance** and usage

## 🔍 Debugging Tips

### Enable API Logging:
```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log(`API Request: ${path}`, options);
}
```

### Check Network Tab:
Browser DevTools में Network tab में API calls देखें:
- Request URL
- Request headers
- Response status
- Response body

### Use Browser Console:
```javascript
// Check auth store state
console.log(useAuthStore.getState());

// Test API directly
api.dashboard().then(console.log).catch(console.error);
```

## 📱 Mobile Considerations

अगर आप mobile app बना रहे हैं:
- API URLs environment variables से configure करें
- Network connectivity handle करें
- Offline mode implement करें
- Background sync add करें

---

यह guide ensure करती है कि आपका frontend properly backend APIs के साथ connect है और सभी features properly working हैं।