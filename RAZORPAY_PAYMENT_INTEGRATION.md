# Razorpay Payment Gateway Integration Guide

यह guide बताती है कि कैसे Razorpay payment gateway को AI Interview Coach में integrate किया गया है।

## 🎯 इस Integration में क्या Include है:

### Backend Features:
1. **Payment Order Creation** - Razorpay order create करने के लिए
2. **Payment Verification** - Signature verification के साथ secure payment verification
3. **Subscription Management** - Subscription create, cancel, और status tracking
4. **User Subscription Updates** - User model में subscription info update
5. **Rate Limiting** - Payment APIs के लिए security

### Frontend Features:
1. **Payment Page** - Beautiful pricing plans with Razorpay integration
2. **Razorpay Checkout** - Seamless payment experience
3. **Subscription Status** - Current subscription display
4. **Cancellation** - Easy subscription cancellation

## 🚀 Setup Instructions

### 1. Razorpay Account Setup

1. **Razorpay Account बनाएं**:
   - [Razorpay Signup](https://razorpay.com/signup/) पर जाएं
   - Business details fill करें
   - Email verification complete करें

2. **API Keys प्राप्त करें**:
   - Razorpay Dashboard में login करें
   - Settings → API Keys में जाएं
   - Test Mode keys generate करें (development के लिए)
   - Production keys generate करें (live payment के लिए)

### 2. Environment Variables Configure करें

#### Backend (`.env`):
```bash
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Frontend (`.env.local`):
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Backend Setup

Backend में already Razorpay integration है। Install करें:

```bash
cd backend
npm install razorpay
```

### 4. Frontend Setup

Frontend में Razorpay checkout script automatically load होता है। Environment variables सेट करें:

```bash
cd frontend
cp .env.example .env.local
```

## 📋 Pricing Plans

### Free Plan (₹0):
- 5 AI interviews per month
- Basic feedback
- Resume analysis (1/month)
- Standard support

### Basic Plan (₹499/month):
- 25 AI interviews per month
- Advanced feedback with scores
- Unlimited resume analysis
- Priority support
- Interview history tracking
- Custom interview modes

### Premium Plan (₹999/month):
- Unlimited AI interviews
- Premium AI feedback
- Unlimited resume analysis
- 24/7 priority support
- Human agent access (5 sessions/month)
- Interview history tracking
- Custom interview modes
- Advanced analytics
- Mock interviews with real experts

## 🔧 Backend API Endpoints

### 1. Create Payment Order
```http
POST /api/payment/create-order
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "plan": "basic" | "premium"
}
```

**Response:**
```json
{
  "orderId": "order_123",
  "amount": 49900,
  "currency": "INR",
  "key": "rzp_test_123",
  "plan": "basic",
  "name": "Basic Plan",
  "description": "25 AI interviews per month with advanced feedback"
}
```

### 2. Verify Payment
```http
POST /api/payment/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "razorpayOrderId": "order_123",
  "razorpayPaymentId": "pay_123",
  "razorpaySignature": "signature_123",
  "plan": "basic"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "_id": "sub_123",
    "userId": "user_123",
    "plan": "basic",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "amount": 49900,
    "currency": "INR"
  }
}
```

### 3. Cancel Subscription
```http
POST /api/payment/cancel
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "status": "cancelled",
    "endDate": "2024-02-01T00:00:00.000Z"
  }
}
```

### 4. Get Subscription Status
```http
GET /api/payment/status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "plan": "basic",
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-01T00:00:00.000Z"
}
```

## 🎨 Frontend Usage

### Payment Page Access
User `/payment` page पर जाकर subscription purchase कर सकते हैं।

### Payment Flow
1. User plan select करता है
2. "Subscribe" button click करता है
3. Razorpay checkout opens होता है
4. Payment complete होता है
5. Backend verifies payment
6. User subscription activates होता है
7. User redirect होता है dashboard पर

### Current Subscription Display
अगर user already subscribed है:
- Active subscription status show होता है
- Plan details display होते हैं
- End date show होता है
- Cancel button available होता है

## 🔒 Security Features

### 1. Signature Verification
Backend में HMAC-SHA256 signature verification:
```typescript
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest("hex");
```

### 2. Payment Verification
Razorpay API से payment status verify:
```typescript
const payment = await razorpay.payments.fetch(razorpayPaymentId);
if (payment.status !== "captured") {
  throw new AppError(400, "Payment not captured");
}
```

### 3. Rate Limiting
Payment APIs पर rate limiting apply किया गया है।

### 4. Authentication
सभी payment APIs require authentication हैं।

## 🧪 Testing

### Test Mode Testing
Razorpay test mode में testing करें:

1. **Test Cards Use करें**:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Any name

2. **Test Failed Payments**:
   - Card Number: `4000 0000 0000 0002`
   - Expiry: Any future date
   - CVV: Any 3 digits

### Local Testing
```bash
# Backend start करें
cd backend
npm run dev

# Frontend start करें  
cd frontend
npm run dev

# Payment page पर जाएं
http://localhost:3000/payment
```

## 📊 Database Schema

### Subscription Model
```typescript
{
  userId: ObjectId,
  plan: "free" | "basic" | "premium",
  status: "active" | "cancelled" | "expired",
  startDate: Date,
  endDate: Date,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: String
}
```

### User Model Update
```typescript
{
  subscription: {
    plan: "free" | "basic" | "premium",
    status: "active" | "cancelled" | "expired" | "none",
    startDate: Date,
    endDate: Date
  }
}
```

## 🔄 Subscription Lifecycle

### New Subscription:
1. User selects plan
2. Payment order created
3. User pays via Razorpay
4. Payment verified
5. Subscription created (status: active)
6. User subscription updated

### Subscription Renewal:
1. Before expiry reminder
2. User can upgrade/downgrade
3. New payment processed
4. Old subscription cancelled
5. New subscription created

### Subscription Cancellation:
1. User clicks cancel
2. Subscription status changed to "cancelled"
3. Access remains until end date
4. After expiry, reverts to free plan

## 🚨 Error Handling

### Common Errors:
1. **Payment Failed**: Razorpay checkout में error
2. **Signature Mismatch**: Tampered payment attempt
3. **Amount Mismatch**: Payment amount doesn't match plan
4. **Payment Not Captured**: Razorpay payment not successful
5. **User Not Found**: Authentication issue

### Error Messages:
Frontend में user-friendly error messages:
- "Payment gateway is loading. Please wait..."
- "Payment failed. Please try again."
- "Unable to initiate payment. Please try again."
- "Payment verification failed. Please contact support."

## 📱 Production Deployment

### Production Keys:
1. Razorpay Dashboard में production keys generate करें
2. Environment variables update करें:
```bash
RAZORPAY_KEY_ID=production_key_id
RAZORPAY_KEY_SECRET=production_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=production_key_id
```

### Vercel Environment Variables:
Vercel Dashboard में environment variables add करें:
- `RAZORPAY_KEY_ID` (Backend)
- `RAZORPAY_KEY_SECRET` (Backend) 
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Frontend)

### Webhooks (Optional):
Razorpay webhooks configure करें:
1. Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Subscribe to events: `payment.captured`, `payment.failed`

## 💡 Best Practices

1. **Always verify payments** on backend
2. **Use HTTPS** in production
3. **Secure API keys** properly
4. **Implement webhooks** for reliability
5. **Handle refunds** appropriately
6. **Keep transaction logs**
7. **Monitor failed payments**
8. **Send payment reminders**
9. **Provide customer support**
10. **Comply with payment regulations**

## 📞 Support

### Razorpay Support:
- [Documentation](https://razorpay.com/docs/)
- [Support](https://razorpay.com/contact/)
- [API Reference](https://razorpay.com/docs/api/)

### Troubleshooting:
1. Check environment variables
2. Verify API keys are correct
3. Ensure backend is running
4. Check browser console for errors
5. Review Razorpay dashboard for failed payments

---

यह integration secure, scalable, और production-ready है। Test mode में पूरी तरह test करने के बाद production में deploy करें।