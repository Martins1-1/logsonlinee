# Keep-Alive Setup Guide

This guide helps you set up a free external service to ping your backend every 5 minutes, preventing Render's free tier from going to sleep and eliminating cold start delays.

---

## Why This Helps

- **Problem**: Render's free tier spins down after 15 minutes of inactivity
- **Impact**: First request after inactivity takes 10-30 seconds (cold start)
- **Solution**: Ping the backend every 5 minutes to keep it awake
- **Result**: All requests are fast, no more "Waking server..." messages

---

## Option 1: Cron-Job.org (Recommended - Easiest)

### Step 1: Sign Up
1. Go to https://cron-job.org/en/
2. Click **Sign up** (free account)
3. Verify your email

### Step 2: Create Cron Job
1. After login, click **Create cronjob**
2. Fill in the form:
   - **Title**: `Legitstore Backend Keep-Alive`
   - **Address (URL)**: `https://legitstore-api.onrender.com/api/health`
   - **Execution schedule**: Select **Every 5 minutes**
   - **Enabled**: ✅ (checked)
3. Click **Create cronjob**

### Step 3: Verify
- Wait 5 minutes
- Check the **Executions** tab to see successful pings
- Go to your site and sign in — should be fast every time

---

## Option 2: UptimeRobot (Alternative)

### Step 1: Sign Up
1. Go to https://uptimerobot.com/
2. Click **Free Sign Up**
3. Verify your email

### Step 2: Add Monitor
1. After login, click **+ Add New Monitor**
2. Fill in the form:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Legitstore Backend`
   - **URL**: `https://legitstore-api.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes
3. Click **Create Monitor**

### Step 3: Verify
- Wait 5 minutes
- Check the dashboard for successful pings (should show green "Up")
- Your backend will stay warm 24/7

---

## Option 3: EasyCron (Another Alternative)

### Step 1: Sign Up
1. Go to https://www.easycron.com/
2. Click **Sign Up** (free plan: 25 tasks/month = 1 task every 5 min)
3. Verify your email

### Step 2: Create Cron Job
1. After login, click **Create Cron Job**
2. Fill in:
   - **URL**: `https://legitstore-api.onrender.com/api/health`
   - **Cron Expression**: `*/5 * * * *` (every 5 minutes)
   - **Name**: `Legitstore Keep-Alive`
3. Click **Create**

### Step 3: Enable and Verify
- Enable the cron job
- Wait a few minutes and check execution logs
- Backend will remain responsive

---

## What Happens After Setup

✅ **Before**:
- User visits site after idle → 10-30 second delay
- "Waking server..." message appears

✅ **After**:
- Backend never goes to sleep
- All requests respond in <1 second
- No "Waking server..." message needed
- Smooth user experience 24/7

---

## Monitoring Your Keep-Alive

### Check if it's working:
1. Look at your Render dashboard → Backend logs
2. You should see a GET request to `/api/health` every 5 minutes
3. Logs will show: `GET /api/health 200` repeatedly

### If it stops working:
- Check your cron service dashboard for failed pings
- Verify the URL is correct: `https://legitstore-api.onrender.com/api/health`
- Make sure Render backend is deployed and running

---

## Cost

All three options offer **free plans** that are sufficient for this use case:
- **Cron-Job.org**: Unlimited free jobs
- **UptimeRobot**: Free for up to 50 monitors
- **EasyCron**: Free for up to 25 tasks/month (plenty for 1 job every 5 min)

---

## Recommended Choice

**Use Cron-Job.org** — it's the simplest, most reliable, and has no limits on the free tier.

---

## Questions?

- **Will this cost me anything on Render?** No, it just keeps the existing free instance awake.
- **Can I use multiple services?** Yes, but one is enough. Multiple pings won't hurt.
- **What if I upgrade Render to paid?** You can disable the keep-alive; paid plans don't sleep.

---

**Setup Time**: 2-3 minutes  
**Maintenance**: None (set and forget)  
**Impact**: Massive improvement in user experience
