# AI Interview Coach

AI Interview Coach is a full-stack voice interview preparation platform. Candidates configure HR, technical, behavioral, custom, or company-specific interviews, answer through a voice-first room, receive AI scoring, and track improvement in a SaaS dashboard.

## Architecture

- `frontend`: Next.js App Router, TypeScript, Tailwind CSS, shadcn-style primitives, Framer Motion, Zustand, React Query, browser speech recognition, WebSocket client.
- `backend`: Node.js, Express, TypeScript, MongoDB/Mongoose, JWT auth with refresh tokens, validation middleware, rate limiting, OpenAI-backed interview generation/evaluation, REST APIs, WebSocket interview events.
- `docker-compose.yml`: MongoDB, backend API, and frontend app.

## Core Flows

1. Candidate signs up or logs in and receives access and refresh tokens.
2. Candidate configures interview mode, duration, difficulty, domain, experience level, language, topics, company, and voice style.
3. Backend generates interview questions using OpenAI, with local fallback data when `OPENAI_API_KEY` is not set.
4. Interview room opens a WebSocket session, speaks AI prompts with browser TTS, captures browser speech recognition transcripts, streams answer events, and receives feedback.
5. Completing an interview writes summary and analytics trend data.
6. Resume upload extracts PDF text, skills, projects, roles, and suggested interview topics.

## API Surface

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/interviews`
- `POST /api/interviews`
- `GET /api/interviews/:id`
- `POST /api/interviews/:id/start`
- `POST /api/interviews/:id/answers`
- `POST /api/interviews/:id/complete`
- `POST /api/voice/transcribe`
- `POST /api/voice/tts`
- `GET /api/resume`
- `POST /api/resume`
- `GET /api/analytics`
- `GET /api/analytics/dashboard`
- `GET /api/security/dashboard` (Admin only)
- `POST /api/security/log-event` (Authenticated)
- `GET /api/security/recommendations` (Admin only)
- `GET /api/security/audit-log` (Admin only)
- `WS /ws/interview?token=<accessToken>`

## Data Models

Implemented Mongoose models:

- `User`
- `Interview`
- `Question`
- `Response`
- `Feedback`
- `ResumeData`
- `Analytics`
- `Subscription`

## Security Features

This application implements comprehensive security measures to protect against common web vulnerabilities:

### Backend Security
- **Input Validation & Sanitization**: Prevents XSS, SQL injection, and command injection attacks
- **Rate Limiting**: Multiple rate limiters for different endpoints (auth, API, file uploads)
- **Account Security**: Account lockout after failed login attempts, secure password handling
- **Request Security**: Content type validation, size limits, timeout protection
- **Security Headers**: CSP, HSTS, XSS protection, frameguard
- **CORS Configuration**: Strict cross-origin resource sharing policies
- **Cookie Security**: HTTP-only, secure, same-site cookies
- **Logging & Monitoring**: Security event tracking and anomaly detection
- **Database Security**: SSL/TLS connections, connection pooling, query validation

### Frontend Security
- **Security Headers**: Custom security headers in Next.js config
- **Input Sanitization**: Client-side input validation and sanitization
- **Secure Storage**: Safe localStorage/sessionStorage wrappers
- **URL Validation**: Protection against malicious redirects
- **Content Security**: CSP nonce generation and validation
- **Rate Limiting**: Client-side API rate limiting

### Security Monitoring
- **Security Dashboard**: Real-time security event monitoring at `/security`
- **Event Logging**: Comprehensive security event tracking
- **Audit Logs**: Security audit trail for admin users
- **Anomaly Detection**: Automated detection of suspicious patterns

For detailed security configuration, see [SECURITY_GUIDE.md](./SECURITY_GUIDE.md).

## Local Development

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`; the backend runs on `http://localhost:4000`.

## Docker

```bash
docker compose up --build
```

For production, replace all secrets, set `OPENAI_API_KEY`, use a managed MongoDB cluster, enable HTTPS at the edge, and configure a real email provider inside `backend/src/services/email.service.ts`.

## Environment Variables

Backend:

- `NODE_ENV`
- `PORT`
- `FRONTEND_URL`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY`
- `SMTP_FROM`
- `COOKIE_DOMAIN`

Frontend:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ENABLE_ANALYTICS`
- `NEXT_PUBLIC_SENTRY_DSN`

## Security Notes

- REST APIs use Helmet, CORS, rate limiting, JWT auth, and Zod validation.
- Resume upload is limited to PDFs and 5 MB.
- Audio upload is limited to 12 MB.
- Production deployments should store refresh tokens in secure HTTP-only cookies, add CSRF protection for cookie auth, and use a managed mailer for verification/reset flows.
- Comprehensive security measures including input sanitization, rate limiting, account lockout, and security monitoring are implemented.
- See [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) for detailed security configuration and best practices.

## Testing Strategy

- Unit test auth token utilities, AI fallback parsing, and score aggregation.
- Integration test auth, protected routes, interview creation, answer submission, resume upload, and dashboard responses with an ephemeral MongoDB instance.
- Contract test WebSocket events: `join`, `transcript`, `interrupt`, and reconnect behavior.
- Frontend component test auth forms, interview configuration, dashboard loading/error states, and interview room controls.
- End-to-end test signup, configure interview, start session, submit transcript, complete interview, and view analytics.
- Security tests for input validation, rate limiting, authentication, and vulnerability prevention.

## Deployment Guide

1. Build and push frontend and backend images from `Dockerfile.frontend` and `Dockerfile.backend`.
2. Provision MongoDB Atlas or an equivalent managed MongoDB service.
3. Configure secrets in your host: JWT secrets, MongoDB URI, OpenAI key, SMTP credentials.
4. Deploy backend behind HTTPS with WebSocket upgrade support.
5. Deploy frontend with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` pointing to the backend.
6. Enable observability: API logs, WebSocket connection counts, OpenAI latency/errors, MongoDB metrics.
7. Add object storage for uploaded resumes if moving beyond memory-buffer processing.
8. Configure security monitoring and alerting for production deployment.

For Vercel deployment, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).
