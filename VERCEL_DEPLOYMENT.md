# Vercel Deployment Guide

## 🚀 Your Deployment URLs

- **Frontend (Vercel)**: https://legitstore.vercel.app
- **Backend (Render)**: https://legitstore-api.onrender.com

---

## ✅ Setup Checklist

### 1. Vercel Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables**

Add the following variable:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://legitstore-api.onrender.com/api` | ✅ Production, ✅ Preview, ✅ Development |

**Important**: After adding the environment variable, Vercel will automatically redeploy.

---

### 2. Render Backend Environment Variables

Go to your Render backend service → **Environment**

Update or add these variables:

| Name | Value | Notes |
|------|-------|-------|
| `FRONTEND_URL` | `https://legitstore.vercel.app` | **Required for CORS** |
| `ECRS_SECRET_KEY` | `ECRS-LIVE-SKsfVD5THLCz8jBURCDxtVA6WPMkgxzVqckCI6VKkf` | Ercaspay live key |
| `ECRS_API_KEY` | `ECRS-LIVE-AKJq2o8D5rTX17WJkkSKPLjkSfWg3Bxx5h8JytS6uW` | Ercaspay API key |
| `ECRS_API_BASE` | `https://api.ercaspay.com/api/v1` | Ercaspay live API |
| `JWT_SECRET` | Your JWT secret | For auth tokens |
| `MONGODB_URL` | Your MongoDB connection string | Database |
| `NODE_ENV` | `production` | Environment |
| `PORT` | `4000` | Server port |

After updating, click **Manual Deploy** → Deploy latest commit

---

## 🧪 Testing the Deployment

### 1. Verify Frontend Loads
- Visit: https://legitstore.vercel.app
- Expected: Landing page loads without white screen
- Check: Browser console should have no errors

### 2. Test Authentication
- Go to: https://legitstore.vercel.app/auth
- Create an account or sign in
- Expected: Redirects to /shop

### 3. Test Payment Flow
- Navigate to Shop page
- Enter amount (e.g., 2000)
- Click **Add Funds**
- **Expected**: New tab opens with Ercaspay checkout
- Complete payment with test card (if in test mode)
- Return to app → Click **Verify**
- **Expected**: Wallet balance updates

---

## 🔍 Troubleshooting

### White screen on refresh
- ✅ Fixed by `vercel.json` rewrite rule
- If still occurring: Check Vercel build logs

### Payment button does nothing
1. Open browser console (F12)
2. Check for errors:
   - **CORS error**: `FRONTEND_URL` not set correctly on backend
   - **404 error**: `VITE_API_URL` not set on Vercel
   - **Network error**: Backend is down

### CORS Error
```
Access to fetch at 'https://legitstore-api.onrender.com/api/payments/create-session' 
from origin 'https://legitstore.vercel.app' has been blocked by CORS policy
```

**Fix**: 
1. Go to Render backend → Environment
2. Set `FRONTEND_URL=https://legitstore.vercel.app`
3. Save and redeploy

### Payment API 404
```
Failed to fetch: 404 Not Found
```

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_API_URL=https://legitstore-api.onrender.com/api`
3. Redeploy if missing

---

## 📋 Quick Reference

### Environment Variable Summary

**Vercel (Frontend)**
```
VITE_API_URL=https://legitstore-api.onrender.com/api
```

**Render (Backend)**
```
FRONTEND_URL=https://legitstore.vercel.app
ECRS_SECRET_KEY=ECRS-LIVE-SKsfVD5THLCz8jBURCDxtVA6WPMkgxzVqckCI6VKkf
ECRS_API_KEY=ECRS-LIVE-AKJq2o8D5rTX17WJkkSKPLjkSfWg3Bxx5h8JytS6uW
ECRS_API_BASE=https://api.ercaspay.com/api/v1
JWT_SECRET=<your-secret>
MONGODB_URL=<your-mongodb-url>
NODE_ENV=production
PORT=4000
```

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repo**: https://github.com/martins0909/legitstore
- **Ercaspay Docs**: https://docs.ercaspay.com

---

## 🎯 Next Steps

1. [ ] Add `VITE_API_URL` to Vercel environment variables
2. [ ] Update `FRONTEND_URL` on Render backend
3. [ ] Redeploy backend on Render
4. [ ] Test payment flow end-to-end
5. [ ] Clear browser localStorage if white screen persists: `localStorage.clear()`

---

**Last Updated**: November 13, 2025
