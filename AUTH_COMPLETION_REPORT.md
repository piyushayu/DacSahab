# DacSahab Authentication — Completion Report

## Authentication is implemented and verified

The full system is running locally right now:

- App: `http://localhost:3000`
- API: `http://localhost:5000`
- Postgres: Docker container `dacsahab-postgres`
- Admin: `admin@dacsahab.local` / `Admin@12345`

The detailed runbook is in **`AUTH_IMPLEMENTATION.md`**.

---

## How it works

### 1. Google OAuth — Auth.js only

- `client/src/auth.ts` configures **only** the Google provider.
- After Google succeeds, Auth.js creates a **60-second one-time session**.
- `/api/auth/complete` reads that session, creates our own JWT cookies, and redirects to the correct dashboard.
- Auth.js is never used to authorize pages, APIs, or Server Actions.

### 2. Email/password — fully custom JWT

- Signup/login live in `client/src/app/actions/auth.ts`.
- Passwords use bcrypt cost 12.
- Wrong email and wrong password both return the same `Invalid email or password` message.
- No email verification and no emails are sent, as requested.

### 3. Token lifecycle

| Credential | Cookie | Lifetime | Scope |
|---|---|---|---|
| Access JWT | `ds_access` | 15 min | `/` |
| Refresh JWT | `ds_refresh` | 7 days | `/api/auth` |
| Session hint | `ds_session` | 7 days | `/` |
| Access expiry | `ds_access_exp` | 15 min | `/` |

- Refresh tokens are stored **hashed** in the `RefreshToken` table.
- Every refresh rotates the token.
- Reuse after a 10-second race window revokes the whole rotation family.
- `tokenVersion` on `User`/`Doctor` allows global session revocation.

### 4. Database identity model

- `User` — patients and admins; no phone field.
- `Doctor` — doctors with their own password, license, specialization, experience, optional phone, and `verified`.
- `LoginIdentity` — **one account per email**, enforced by a primary key and a CHECK constraint.
- `Account` / `DoctorAccount` — Google accounts for users/doctors.
- `RefreshToken` — rotating refresh families.
- `Appointment` — real relation; both `User` and `Doctor` expose `appointments[]`.
- `Review` — placeholder for the next feature layer.

### 5. Route protection

**Next.js proxy** (`client/src/proxy.ts`):

- Valid access token → continue.
- Expired access + session hint → silent refresh.
- No session → `/login?next=...`.
- Incomplete onboarding → only the role dashboard.
- Wrong role/kind → correct dashboard.
- API routes get JSON `401`/`403` instead of HTML redirects.

**Express middleware** (`server/src/middleware/auth.ts`):

- `requireAuth`
- `requireRole`
- `requireKind`
- `requireOnboarded`
- `requireVerifiedDoctor` — DB-backed verification gate.

### 6. Onboarding gates

- Patient signup collects only name, email, password.
- Doctor signup collects only name, email, password.
- Incomplete patient → `/dashboard` shows the profile form; all other pages redirect back.
- Incomplete doctor → `/doctor/dashboard` shows professional details; all other pages redirect back.
- On save, the form navigates to `/api/auth/reissue`, which:
  - revokes the old refresh family,
  - issues a new session with `onboarded: true`,
  - redirects to the dashboard.
- Logout posts to `/api/auth/logout` so the path-scoped refresh cookie is actually sent and the family is revoked server-side.

---

## How to see it

1. Open `http://localhost:3000/signup`.
2. Sign up as a patient.
3. You land on `/dashboard` with **Complete your profile**.
4. Try `/appointments` — you are redirected back to `/dashboard`.
5. Save the profile — you get the full dashboard.
6. Sign out, sign back in.
7. Sign up as a doctor — complete the professional details and see **Verification pending**.
8. Log in as the seeded admin — you land on `/admin/dashboard`.

Useful URLs:

| URL | Purpose |
|---|---|
| `/signup` | Patient or doctor signup |
| `/login` | Email/password + Google |
| `/dashboard` | Patient dashboard |
| `/doctor/dashboard` | Doctor dashboard |
| `/admin/dashboard` | Admin dashboard |
| `/appointments` | Patient-only placeholder |
| `/api/auth/me` | Current account JSON |
| `localhost:5000/api/health` | Express health |
| `localhost:5000/api/me` | Express JWT claims |

### Google OAuth

Google credentials are currently blank, so the Google button shows a friendly **“Google sign-in is not configured yet”** notice.

To enable it:

1. Create a Google OAuth **Web application** client.
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`.
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `client/.env.local`.
4. Restart the Next.js dev server.

---

## Verification completed

Both builds pass (`client` and `server`), and the Playwright suites pass:

- Patient signup → onboarding gate → profile completion.
- Onboarding reissue revokes the old refresh family.
- All four auth cookies set correctly.
- `/api/auth/me` and Express `/api/me`.
- Patient/doctor role separation.
- Refresh rotation, race grace, stale reuse rejection, family revocation.
- Logout clears cookies **and** revokes the refresh token server-side.
- Doctor signup → onboarding → verification pending.
- Unverified doctor blocked; verified doctor allowed after DB update.
- Admin login and role redirects.
- Duplicate email across `User`/`Doctor` blocked.
- Wrong password rejected generically.
- Google-not-configured notice.
- Unauthenticated redirects and `401` responses.
- Deep-link login preserves the intended destination.

Test accounts were cleaned up; the database now contains only the seeded admin.

All changes are currently uncommitted.
