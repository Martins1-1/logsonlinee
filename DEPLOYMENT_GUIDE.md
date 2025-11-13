# Ercaspay Payment Integration - Deployment Guide

## Overview
This guide covers deploying the Joy Buy Plaza application with Ercaspay payment integration to Vercel (frontend) and Render (backend).

---

## 1. Backend Deployment (Render)

### Step 1: Configure Environment Variables
Go to your Render dashboard → Select your backend service → Environment

Add the following environment variables:

```
ECRS_SECRET_KEY=ECRS-LIVE-SKsfVD5THLCz8jBURCDxtVA6WPMkgxzVqckCI6VKkf
ECRS_API_KEY=ECRS-LIVE-AKJq2o8D5rTX17WJkkSKPLjkSfWg3Bxx5h8JytS6uW
ECRS_API_BASE=https://api.ercaspay.com/api/v1
```

**Important Security Notes:**
- These are LIVE credentials for production use
- For testing, use test credentials (replace LIVE with TEST in keys)
- Test API Base: `https://api-staging.ercaspay.com/api/v1`
- Never commit these keys to Git or expose them in frontend code

### Step 2: Ensure Existing Variables Are Set
Verify these existing environment variables are still configured:

```
JWT_SECRET=<your-secret-jwt-key>
MONGODB_URL=<your-mongodb-atlas-connection-string>
PORT=4001
FRONTEND_URL=<your-vercel-frontend-url>
```

### Step 3: Deploy Backend
The backend will auto-deploy when you push to GitHub main branch. You can also trigger a manual deploy:
1. Go to Render dashboard → Your service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for build to complete (~2-5 minutes)
4. Check logs for any errors

### Step 4: Verify Backend is Running
Test the health endpoint:
```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Frontend Deployment (Vercel)

### Step 1: Configure Environment Variables
Go to Vercel dashboard → Your project → Settings → Environment Variables

Add/update:
```
VITE_API_URL=https://your-backend-name.onrender.com
```

**Example:**
If your Render backend is at `https://legitstore-backend.onrender.com`, then:
```
VITE_API_URL=https://legitstore-backend.onrender.com
```

### Step 2: Redeploy Frontend
Vercel auto-deploys on Git push, but you can also trigger manual redeploy:
1. Go to Vercel dashboard → Your project → Deployments
2. Click "..." menu on latest deployment → "Redeploy"
3. Wait for build (~1-2 minutes)

### Step 3: Verify Frontend Connection
1. Open your deployed site (e.g., https://legitstore.vercel.app)
2. Open browser DevTools → Console
3. Navigate to the Shop page
4. Check that API calls are going to your Render backend URL
5. Try the "Add Funds" feature

---

## 3. Testing Payment Flow

### Testing in Staging Mode (Recommended First)

1. **Switch to Test Credentials** on Render:
   ```
   ECRS_SECRET_KEY=ECRS-TEST-SKLVbpD1J7DG9fwwdyddcAkEysTKsYD564S1NDSUBS
   ECRS_API_BASE=https://api-staging.ercaspay.com/api/v1
   ```

2. **Use Ercaspay Test Cards**:
   - **Mastercard**: 2223000000000007 | CVV: 111 | Expiry: 01/39 | PIN: 1234
   - **Visa**: 4000000000002503 | CVV: 111 | Expiry: 03/50 | PIN: 1111
   - **Verve (Success)**: 5060990580000217499 | CVV: 111 | Expiry: 03/50 | PIN: 123456 | OTP: 123456
   - **Verve (Insufficient Funds)**: 5060990580000000390 | CVV: 111 | Expiry: 03/50 | PIN: 123456 | OTP: 123456

3. **Test the Complete Flow**:
   - Go to Shop page
   - Enter amount (e.g., ₦5000)
   - Click "Add Funds"
   - Dialog opens with payment details
   - New tab opens with Ercaspay checkout page
   - Complete payment with test card
   - Return to your app
   - Click "I've completed payment — Verify"
   - Balance should update

4. **Check Ercaspay Dashboard**:
   - Login to test dashboard: http://merchant-staging.ercaspay.com/
   - View transaction under "Transactions" or "Payments"
   - Verify transaction status and amount

### Testing in Live Mode (Production)

1. **Switch to Live Credentials** on Render (use the credentials provided earlier)

2. **Test with Small Real Amount**:
   - Use a real card (yours or test with small amount like ₦100)
   - Complete the flow as above
   - Verify balance updates correctly

3. **Monitor Live Dashboard**:
   - Login to live dashboard: https://merchant.ercaspay.com
   - Monitor transactions
   - Check settlements and payouts

---

## 4. Payment Flow Endpoints

The backend provides these Ercaspay integration endpoints:

### POST /api/payments/create-session
Creates a new payment checkout session.

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "NGN",
  "userId": "user123",
  "email": "customer@example.com",
  "callbackUrl": "https://yourapp.com/shop"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.ercaspay.com/...",
  "reference": "ERCS|20241215100000|..."
}
```

### GET /api/payments/verify?reference=ERCS|...
Verifies a payment transaction.

**Response:**
```json
{
  "success": true,
  "status": "success",
  "amount": 5000,
  "reference": "ERCS|20241215100000|...",
  "data": { /* full transaction details */ }
}
```

### GET /api/payments/status/:reference
Fetches detailed transaction information (alternative to verify).

---

## 5. Troubleshooting

### Backend Issues

**Problem:** Payment endpoints return 500 error
- **Check:** Environment variables are set correctly on Render
- **Check:** Backend logs for Ercaspay API errors
- **Solution:** Verify ECRS_SECRET_KEY is correct and not expired

**Problem:** "Module not found" error for @capitalsage/ercaspay-nodejs
- **Check:** package.json includes the dependency
- **Solution:** Run `npm install` and redeploy

**Problem:** TypeScript compilation errors
- **Check:** The type declaration file exists at `server/src/types/ercaspay-nodejs.d.ts`
- **Solution:** Ensure file is committed to Git

### Frontend Issues

**Problem:** VITE_API_URL not pointing to backend
- **Check:** Environment variable is set on Vercel
- **Solution:** Update variable and redeploy

**Problem:** CORS errors when calling backend
- **Check:** Backend CORS configuration includes frontend URL
- **Solution:** Add your Vercel URL to CORS origins in `server/src/index.ts`

**Problem:** Payment dialog doesn't open checkout URL
- **Check:** Browser console for API errors
- **Check:** Network tab to see if create-session call succeeded
- **Solution:** Verify backend is returning `checkoutUrl` in response

### Payment Issues

**Problem:** Ercaspay returns "Unauthorized" error
- **Check:** ECRS_SECRET_KEY is correct
- **Check:** Authorization header format: `Bearer ECRS-LIVE-...`
- **Solution:** Verify credentials from Ercaspay dashboard

**Problem:** Payment succeeds but verification fails
- **Check:** Reference is being passed correctly
- **Check:** Backend logs for verify endpoint errors
- **Solution:** Ensure reference format matches Ercaspay's expected format

**Problem:** Balance doesn't update after payment
- **Check:** Frontend localStorage is being updated
- **Check:** Verify endpoint returns `status: "success"`
- **Solution:** Check browser console for errors in verifyTopup function

---

## 6. Optional Enhancements

### Add Webhook for Instant Notifications
Instead of manual verification, Ercaspay can notify your backend automatically:

1. **Create webhook endpoint** in `server/src/routes/payments.ts`:
```typescript
router.post('/webhook', async (req, res) => {
  // Verify webhook signature
  // Update user balance in MongoDB
  // Return 200 OK
});
```

2. **Register webhook URL** in Ercaspay dashboard:
   - URL: `https://your-backend.onrender.com/api/payments/webhook`
   - Events: `payment.success`, `payment.failed`

3. **Update Shop.tsx** to poll or use WebSocket for instant balance updates

### Save Transactions to Database
Instead of only localStorage, save transactions to MongoDB:

1. **Create Transaction model** in `server/src/models/index.ts`
2. **Update verify endpoint** to save successful payments
3. **Add transaction history endpoint** to fetch user's past transactions

### Add Transaction History Page
Create a new page to show all user transactions with filters and export.

---

## 7. Going Live Checklist

Before switching to live mode:

- [ ] Test complete payment flow in staging with test cards
- [ ] Verify all test transactions appear in Ercaspay test dashboard
- [ ] Test error cases (insufficient funds, timeout, cancelled)
- [ ] Update environment variables to use LIVE credentials
- [ ] Test with small real payment (₦100-500)
- [ ] Monitor Ercaspay live dashboard for transaction
- [ ] Verify balance updates correctly
- [ ] Set up webhook endpoint (optional but recommended)
- [ ] Test refund process if applicable
- [ ] Document customer support flow for payment issues
- [ ] Set up monitoring/alerts for failed payments

---

## 8. Support & Resources

### Ercaspay Resources
- **Documentation**: https://docs.ercaspay.com
- **Live Dashboard**: https://merchant.ercaspay.com
- **Test Dashboard**: http://merchant-staging.ercaspay.com/
- **Support Email**: support@ercaspay.com
- **NodeJS SDK**: https://www.npmjs.com/package/@capitalsage/ercaspay-nodejs

### Your Application
- **GitHub Repository**: https://github.com/martins0909/legitstore
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Merchant Name**: Legitstorez

---

## Quick Reference Commands

```bash
# Install dependencies locally
cd server
npm install

# Run backend locally (requires .env file)
npm run dev

# Build backend for production
npm run build

# Test payment creation locally
curl -X POST http://localhost:4001/api/payments/create-session \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"currency":"NGN","userId":"test","email":"test@example.com"}'

# Test payment verification locally
curl http://localhost:4001/api/payments/verify?reference=ERCS|20241215100000|123456
```

---

## Environment Variables Summary

### Render (Backend)
```env
# Ercaspay Credentials
ECRS_SECRET_KEY=ECRS-LIVE-SKsfVD5THLCz8jBURCDxtVA6WPMkgxzVqckCI6VKkf
ECRS_API_KEY=ECRS-LIVE-AKJq2o8D5rTX17WJkkSKPLjkSfWg3Bxx5h8JytS6uW
ECRS_API_BASE=https://api.ercaspay.com/api/v1

# Application Settings
JWT_SECRET=<your-jwt-secret>
MONGODB_URL=<your-mongodb-connection-string>
PORT=4001
FRONTEND_URL=<your-vercel-url>
```

### Vercel (Frontend)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
