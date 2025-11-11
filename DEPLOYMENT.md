Deployment guide — Render (backend) + Vercel (frontend)

This guide walks through deploying the monorepo where the frontend lives in `client/` and the backend lives in `server/`.

Assumptions
- Repo is hosted on GitHub and connected to Render & Vercel
- You want Backend on Render (Web Service) and Frontend on Vercel (Static)

---

1) Deploy backend to Render (Web Service)

Create a new Web Service on Render and use these exact settings:

- Name: joy-buy-plaza-server
- Git Provider: GitHub
- Repository: select your repo
- Branch: main (or your deployment branch)
- Root Directory: server
- Environment: Node
- Build Command: npm install && npm run build
- Start Command: npm run start
- Instance Type: Starter (or as needed)

Environment variables (Render dashboard → Environment → Add Environment Variable):
- MONGODB_URL = mongodb+srv://<USER>:<PASS>@cluster0.... (your Atlas connection string)
- JWT_SECRET = <a strong random secret>
- PAYSTACK_SECRET = <your paystack secret> (optional)
- FRONTEND_URL = https://<your-vercel-app>.vercel.app

After creating the service, deploy. Use the Render service logs to confirm the server started and that `/api/health` returns `{ ok: true }`.

Health check (once service is live):
- https://<your-service>.onrender.com/api/health

Important notes for Render & monorepo:
- Set "Root Directory" to `server` so Render runs `npm install` and `npm run build` inside that folder.
- Render will provide a `PORT` env variable; the server already uses `process.env.PORT`.

---

2) Deploy frontend to Vercel

Create a new project on Vercel and import your GitHub repo. Use these settings:

- Project Name: joy-buy-plaza-client
- Root Directory: client
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

Environment variables (Vercel → Project Settings → Environment Variables):
- VITE_API_URL = https://<your-backend-service>.onrender.com

Deploy. When finished, Vercel will give you a URL like `https://joy-buy-plaza-client.vercel.app`.

After Vercel deployment, copy the deployed frontend URL and add it to Render's `FRONTEND_URL` env var (or add it as an allowed origin if you changed CORS manually).

---

3) Verify end-to-end

- Visit the Vercel frontend URL.
- Open the browser DevTools → Network and confirm requests to `${VITE_API_URL}/api/*` are succeeding.
- Test `/api/health` directly:
  - https://<your-backend>.onrender.com/api/health
- Use the Admin page to log in:
  - Email: admin@local
  - Password: adminpass

---

Alternative: Deploy both to Render

If you prefer a single provider, you can deploy both to Render:
- Create a Static Site in Render for the frontend with Root Dir `client`, Build Command `npm install && npm run build`, Publish Directory `client/dist`.
- Create the Web Service for the backend the same way (Root Dir `server`, Build/Start as above).

---

CORS troubleshooting

If the frontend can't reach the backend in production, ensure:
- `FRONTEND_URL` in Render matches the exact origin of the frontend (including https://)
- The backend `server/src/index.ts` is using `process.env.FRONTEND_URL` in its CORS allowlist (already implemented in this repo)

---

Local build/test commands

Build frontend locally:

```powershell
npm run build --prefix client
# serve the built site with a static server if you want to test locally, e.g.:
# npx serve client/dist -p 5000
```

Build backend locally (compile TypeScript):

```powershell
npm run build --prefix server
node server/dist/index.js
```

---

If you want, I can also:
- Add Render `service.yaml` and Vercel `vercel.json` configuration files
- Add GitHub Actions to run tests/builds on push
- Replace any other remaining hard-coded API URLs across the repo

Tell me which next step you'd like me to take.
