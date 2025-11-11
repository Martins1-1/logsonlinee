# Server (backend)

Express + MongoDB backend with Paystack integration for payments.

Prereqs
- Node >= 18
- MongoDB (local or remote). You can use Docker to run a dev MongoDB: `docker run -p 27017:27017 -d --name joy-mongo mongo:6`

Setup

1. cd server
2. npm install
3. copy `.env.example` to `.env` and edit (set `MONGODB_URL`, `JWT_SECRET`, `PAYSTACK_SECRET`)
4. npm run dev

Seeding

- Run `npx ts-node src/seed.ts` to create an admin (`admin@local` / `adminpass`) and a sample user.

Paystack

- Set `PAYSTACK_SECRET` in your `.env`. For testing you can use your Paystack test secret key. The server provides `/api/payments/initialize` and `/api/payments/verify/:reference` endpoints.

Notes
- The server listens on PORT (default 4000). Admin login seeded as `admin@local` / `adminpass` by the seed script.
