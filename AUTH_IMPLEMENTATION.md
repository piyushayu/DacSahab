# DacSahab Auth — Implementation & Runbook

This is the shipped authentication system for DacSahab. It uses **Auth.js only for Google OAuth**. Email/password auth is a fully custom JWT system and never touches Auth.js.

---

## 1. Architecture at a glance

```
Browser
  │
  ├─ Next.js (port 3000)
  │    ├─ /login, /signup                    → Server Actions
  │    ├─ /dashboard, /doctor/dashboard       → Server Components + DAL
  │    ├─ /api/auth/refresh                  → rotate refresh token
  │    ├─ /api/auth/reissue                  → re-issue after onboarding
  │    ├─ /api/auth/logout                   → revoke session
  │    ├─ /api/auth/me                       → current account JSON
  │    ├─ /api/auth/complete                 → Auth.js → custom JWT handoff
  │    └─ proxy.ts                           → optimistic route guard
  │
  └─ Express API (port 5000)
       ├─ requireAuth                        → verify access JWT
       ├─ requireRole / requireKind          → role checks
       ├─ requireOnboarded                   → onboarding gate
       └─ requireVerifiedDoctor              → DB-backed verification gate
```

### Auth.js boundary

- `client/src/auth.ts` configures **only** the Google provider.
- Auth.js creates a **60-second, one-time session** after Google succeeds.
- `client/src/app/api/auth/complete/route.ts` reads that session, creates our own
  `ds_access` / `ds_refresh` cookies, and redirects to the correct dashboard.
- Auth.js is never used to authorize a page, API, or Server Action.

### Email/password boundary

- `client/src/app/actions/auth.ts` handles signup/login.
- Passwords are hashed with **bcrypt cost 12** (`client/src/lib/auth/password.ts`).
- Login returns a generic `Invalid email or password` and burns a dummy bcrypt
  comparison for unknown emails.
- On success it calls `createSession()` and redirects to the role dashboard.

---

## 2. Token and session lifecycle

| Credential | Cookie | Lifetime | Path | Notes |
|---|---|---|---|---|
| Access JWT | `ds_access` | 15 minutes | `/` | httpOnly, signed HS256 |
| Refresh JWT | `ds_refresh` | 7 days | `/api/auth` | httpOnly, rotated on use |
| Session hint | `ds_session` | 7 days | `/` | httpOnly presence flag for the proxy |
| Access expiry | `ds_access_exp` | 15 minutes | `/` | readable timestamp for proactive refresh |

- Access JWT claims: `sub`, `kind` (`USER`/`DOCTOR`), `role`
  (`PATIENT`/`DOCTOR`/`ADMIN`), `onboarded`, `tokenVersion`, `iss`, `aud`.
- Refresh JWT claims: `sub`, `kind`, `jti`, `tokenVersion`.
- The DB stores only a **SHA-256 hash** of each refresh token.
- Every refresh rotates the token:
  - New row in `RefreshToken`.
  - Old row gets `revokedAt` + `replacedBy`.
  - The whole rotation family is revoked if an old token is reused after a
    **10-second race grace window**.
- `tokenVersion` on `User`/`Doctor` is bumped to revoke every access token for
  an account (`revokeAllSessions`).
- Onboarding completion updates the database, then the form performs a full
  navigation to `/api/auth/reissue`. That route revokes the previous rotation
  family, issues a new pair whose access token has `onboarded: true`, and
  redirects to the dashboard.
- Logout is a form POST to `/api/auth/logout` (not a Server Action), because
  `ds_refresh` is path-scoped to `/api/auth`. The route can therefore revoke the
  refresh family before clearing cookies and redirecting to `/login`.

### Proxy refresh flow

`client/src/proxy.ts` verifies `ds_access` without a DB call:

- Valid access token → continue.
- Expired access + `ds_session` present → redirect to
  `/api/auth/refresh?next=<original-path>`.
- No session → redirect to `/login?next=<original-path>`.
- Incomplete onboarding → allow only the role dashboard.
- Wrong role/kind → redirect to the correct dashboard.
- API routes get JSON `401`/`403` instead of HTML redirects.

---

## 3. Database model

The Prisma schema is `server/prisma/schema.prisma`.

| Model | Purpose |
|---|---|
| `User` | Patients and admins. No phone field. |
| `Doctor` | Doctors with own password hash, license, specialization, experience, optional phone, `verified`. |
| `LoginIdentity` | **DB-enforced one-account-per-email** table. `email` is the primary key; a CHECK constraint requires exactly one of `userId`/`doctorId`. |
| `Account` | Google OAuth accounts linked to a `User`. |
| `DoctorAccount` | Google OAuth accounts linked to a `Doctor`. |
| `RefreshToken` | Rotating refresh-token families with hash, expiry, revocation, user agent, IP. |
| `Appointment` | Real relation from `User` and `Doctor`; both expose `appointments[]`. |
| `Review` | Doctor reviews (placeholder for the next feature). |

Key guarantees:

- One email cannot exist in both `User` and `Doctor`.
- One email cannot have two identities.
- A refresh token belongs to exactly one account kind (CHECK constraint).
- `Doctor.licenseNumber` is unique when present.
- `Doctor.verified` defaults to `false` and is checked by the Express
  `requireVerifiedDoctor` middleware.

---

## 4. Onboarding gates

- Patient signup collects only **name, email, password**.
- Doctor signup collects only **name, email, password** — no license,
  specialization, or experience yet.
- After login:
  - Patient with `onboardingCompleted = false` → `/dashboard` shows the profile
    form. All other pages redirect back to `/dashboard`.
  - Doctor with `onboardingCompleted = false` → `/doctor/dashboard` shows the
    professional-details form. All other pages redirect back.
- Doctor onboarding collects license number, specialization, experience, and
  optional phone.
- After saving, the form navigates to `/api/auth/reissue`, which revokes the
  old refresh family and issues a new session with `onboarded: true`.
- Unverified doctors can see their dashboard but are blocked from
  patient-facing/verified-only APIs by `requireVerifiedDoctor`.

---

## 5. Environment variables

### `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dacsahab?schema=public"

AUTH_SECRET=<random-32-byte-base64>
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

JWT_ACCESS_SECRET=<random-32-byte-base64>
JWT_REFRESH_SECRET=<random-32-byte-base64>
```

### `server/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dacsahab?schema=public"
JWT_ACCESS_SECRET=<must match client/.env.local>
```

Generate secrets with:

```bash
node -e "const c=require('crypto'); console.log(c.randomBytes(32).toString('base64'))"
```

---

## 6. How to run it

### 1. Start Postgres

If the container already exists:

```bash
docker start dacsahab-postgres
```

If not:

```bash
docker run -d --name dacsahab-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=dacsahab \
  -p 5432:5432 \
  postgres:17-alpine
```

### 2. Server

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

API: `http://localhost:5000`

### 3. Client

```bash
cd client
npm install
npm run db:generate   # only needed after a schema change / fresh clone
npm run dev
```

App: `http://localhost:3000`

### 4. Seeded admin

```
Email:    admin@dacsahab.local
Password: Admin@12345
```

Login redirects to `/admin/dashboard`.

---

## 7. What to open in the browser

| URL | What it does |
|---|---|
| `http://localhost:3000/signup` | Patient or doctor signup |
| `http://localhost:3000/login` | Email/password login + Google button |
| `http://localhost:3000/dashboard` | Patient dashboard / profile setup |
| `http://localhost:3000/doctor/dashboard` | Doctor dashboard / onboarding |
| `http://localhost:3000/admin/dashboard` | Admin dashboard |
| `http://localhost:3000/appointments` | Patient-only appointments placeholder |
| `http://localhost:3000/api/auth/me` | Current account JSON |
| `http://localhost:5000/api/health` | Express health check |
| `http://localhost:5000/api/me` | Express JWT claims |

### Quick manual test

1. Sign up as a patient.
2. You land on `/dashboard` with “Complete your profile”.
3. Try `/appointments` — you are redirected back to `/dashboard`.
4. Save the profile — you land on the full dashboard.
5. Sign out and sign back in.
6. Sign up as a doctor — you land on `/doctor/dashboard` with the professional
   details form.
7. Save the details — you see “Verification pending”.
8. Log in as the seeded admin — you land on `/admin/dashboard`.

---

## 8. Google OAuth setup

Google credentials are intentionally blank in this environment, so the Google
button shows a friendly “not configured” notice instead of crashing.

To enable Google:

1. Google Cloud Console → **APIs & Services → Credentials**.
2. Create an **OAuth client ID → Web application**.
3. Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Put the client ID/secret in `client/.env.local`:
   ```env
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ```
5. Restart the Next.js dev server.

Google accounts are linked by verified email into `Account` (patients) or
`DoctorAccount` (doctors). The role selected on the login/signup screen decides
which table gets a new Google-only account.

---

## 9. Verification performed

- Patient signup → profile setup → dashboard.
- Onboarding gate blocks `/appointments` until the profile is complete.
- Onboarding reissue revokes the previous refresh family and issues an
  `onboarded: true` token.
- All four cookies are set correctly.
- `/api/auth/me` returns the current account.
- Express accepts the `ds_access` cookie.
- Patient is allowed on patient routes and rejected on doctor routes.
- Refresh rotates the refresh token.
- Refresh reuse inside the grace window gets `REFRESH_RACE`.
- Refresh reuse after 10 seconds revokes the whole family.
- Logout clears cookies, and the old refresh token is rejected server-side.
- Patient can log in again.
- Doctor signup → onboarding → verification pending.
- Unverified doctor is blocked by `requireVerifiedDoctor`; after setting
  `verified = true`, the same route returns 200.
- Admin login → `/admin/dashboard`; admin is redirected away from doctor routes.
- Duplicate email across `User`/`Doctor` is blocked.
- Wrong password returns `Invalid email or password`.
- Google button reports missing credentials gracefully.
- Unauthenticated page requests redirect to `/login`.
- Unauthenticated `/api/auth/me` returns `401`.
- Deep-link login preserves the intended destination.

---

## 10. Deliberate scope / future work

- No email verification and no emails are sent (as requested).
- No password reset yet; the “Forgot password?” link is a placeholder.
- No rate limiting yet. Add it at the edge/proxy and on the login Server Action
  before production.
- No admin verification UI yet; the `verified` flag and DB gate are ready.
- Appointment booking, doctor discovery, and reviews are the next feature layer.
