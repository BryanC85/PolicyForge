# PolicyForge FireFly (Web-Only, Firebase + Stripe, SiteGround Ready)

This build converts PolicyForge into a **fully web-based platform** designed for your stack:
- **Hosting:** SiteGround (Node.js app hosting)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **File Storage:** Firebase Storage
- **Payments:** Stripe
- **AI:** OpenAI API

Everything reads secrets from **one master API config file**: `frontend/lib/masterApiConfig.js`.

---

## 1) What You Need (Decisions Made)

To make this production-capable with Firebase + Stripe, these are the required pieces:

1. **Next.js full-stack app** (UI + API routes in one web app)
2. **Firebase project**
   - Firestore (document DB)
   - Auth (users + roles custom claims)
   - Storage (policy uploads + reports)
3. **Stripe products/prices** for subscription billing
4. **OpenAI API key** for embeddings/audit intelligence
5. **Environment variables** in one central location (`masterApiConfig`)

---

## 2) Project Structure

- `frontend/app/*` → all pages and API routes
- `frontend/lib/masterApiConfig.js` → single source for all API keys/env
- `frontend/lib/firebaseAdmin.js` → server-side Firebase access
- `frontend/lib/firebaseClient.js` → browser-side Firebase access
- `frontend/lib/stripe.js` → Stripe server client
- `frontend/app/api/*` → `/upload`, `/review`, `/chat`, `/audit`, `/acknowledge`, billing checkout

---

## 3) Step-by-Step Setup

## Step 1 — Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com).
2. Create project: `policyforge-firefly`.
3. Enable:
   - **Authentication** (Email/Password to start)
   - **Firestore Database** (production mode)
   - **Storage**
4. In Project Settings → Service Accounts:
   - Generate admin key JSON
   - Save `client_email` and `private_key` for environment variables.

## Step 2 — Create Stripe Products
1. Go to Stripe Dashboard.
2. Create subscription product(s) for your plans.
3. Copy each `price_id` (used in `/api/billing/checkout`).
4. Create webhook endpoint for your production URL:
   - Event examples: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.updated`
5. Copy your webhook signing secret.

## Step 3 — Configure Environment Variables
Create `frontend/.env.local` with:

```bash
# Firebase (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only)
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> All keys are loaded through `frontend/lib/masterApiConfig.js`.

## Step 4 — Install & Run Locally
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.

## Step 5 — Configure Firestore Collections
The app writes to these collections:
- `documents`
- `document_chunks`
- `policy_reviews`
- `chat_logs`
- `audit_events`
- `policy_acknowledgements`

Each document includes `organization_id` for tenant isolation logic.

## Step 6 — Deploy on SiteGround
1. In SiteGround Site Tools, create Node.js app.
2. Set runtime to Node 20+.
3. Deploy code (Git/SFTP).
4. Run build commands in project `frontend` folder:
   - `npm install`
   - `npm run build`
   - `npm run start`
5. Add all environment variables in SiteGround Node app settings.
6. Set `NEXT_PUBLIC_APP_URL` to your real domain.

## Step 7 — Production Hardening (Important)
1. Add Firebase Security Rules to enforce org-scoped access.
2. Add JWT/role middleware for all `/api/*` routes.
3. Add malware scanning service for upload pipeline.
4. Add Stripe webhook handler to lock chat access if unpaid.
5. Add report PDF generation worker.

---

## 4) API Endpoints (Web-Based)

- `POST /api/upload` → upload + storage + chunking + audit event
- `POST /api/review` → compliance analysis output
- `POST /api/chat` → employee policy assistant response
- `GET /api/audit?organization_id=...` → exportable audit event stream
- `POST /api/acknowledge` → policy acknowledgment tracking
- `POST /api/billing/checkout` → Stripe checkout URL

---

## 5) Design Language: “FireFly”

UI direction implemented:
- Glassmorphism cards
- Dark aurora gradients
- Rounded controls and soft depth
- Minimal, premium, high-clarity layout

Goal: **Apple-grade polish + Google-grade clarity**.
