# DacSahab Auth — File Structure & Flow Map

This is the "which file do I open next?" guide for the authentication system.
Read it top to bottom for the full tour, or jump to a flow.

Companion docs:

- `AUTH_IMPLEMENTATION.md` — runbook, architecture, environment setup.
- `AUTH_COMPLETION_REPORT.md` — final completion summary and verification list.

---

## 1. Project tree (auth-related files only)

```text
Dacsahab/
├─ AUTH_IMPLEMENTATION.md
├─ AUTH_COMPLETION_REPORT.md
├─ AUTH_FILE_FLOW.md                      ← this file
│
├─ client/
│  ├─ .env.local                          # secrets, DB URL, Google credentials
│  └─ src/
│     ├─ auth.ts                          # Auth.js config — Google provider only
│     ├─ proxy.ts                         # Next.js optimistic route guard
│     ├─ types/
│     │  └─ next-auth.d.ts                # appSub / appKind session typing
│     │
│     ├─ generated/prisma/                # generated Prisma client (gitignored)
│     │
│     ├─ app/
│     │  ├─ layout.tsx
│     │  ├─ page.tsx
│     │  ├─ login/page.tsx
│     │  ├─ signup/page.tsx
│     │  ├─ dashboard/page.tsx            # patient dashboard + profile gate
│     │  ├─ doctor/dashboard/page.tsx     # doctor dashboard + onboarding gate
│     │  ├─ admin/dashboard/page.tsx      # admin dashboard
│     │  ├─ appointments/page.tsx         # patient-only placeholder
│     │  ├─ auth/continue/page.tsx        # fallback redirect page
│     │  │
│     │  ├─ actions/
│     │  │  ├─ auth.ts                    # signup, login, Google start
│     │  │  └─ onboarding.ts              # patient profile, doctor details
│     │  │
│     │  └─ api/auth/
│     │     ├─ [...nextauth]/route.ts     # Auth.js HTTP handlers
│     │     ├─ complete/route.ts          # Auth.js → custom JWT handoff
│     │     ├─ refresh/route.ts           # rotate refresh token
│     │     ├─ reissue/route.ts           # new session after onboarding
│     │     ├─ logout/route.ts            # revoke family + clear cookies
│     │     └─ me/route.ts                # current account JSON
│     │
│     ├─ components/
│     │  ├─ auth/
│     │  │  ├─ AuthLayout.tsx
│     │  │  ├─ AuthSkeleton.tsx
│     │  │  ├─ RoleSelector.tsx
│     │  │  ├─ GoogleAuthButton.tsx
│     │  │  ├─ LoginForm.tsx
│     │  │  └─ SignupForm.tsx
│     │  └─ dashboard/
│     │     ├─ DashboardShell.tsx         # header, user badge, logout form
│     │     ├─ PatientProfileForm.tsx     # patient onboarding
│     │     └─ DoctorOnboardingForm.tsx   # doctor onboarding
│     │
│     └─ lib/
│        ├─ api.ts                        # browser helper for Express API
│        ├─ dal.ts                        # authoritative session/DB guards
│        ├─ prisma.ts                     # Prisma client (client app)
│        ├─ validation/auth.ts            # Zod schemas + field errors
│        └─ auth/
│           ├─ config.ts                  # TTLs, cookie names, secrets
│           ├─ types.ts                   # AccessClaims / RefreshClaims
│           ├─ tokens.ts                  # sign/verify JWTs, hash tokens
│           ├─ password.ts                # bcrypt hash/verify/dummy check
│           ├─ accounts.ts                # User/Doctor/LoginIdentity queries
│           ├─ session.ts                 # create/rotate/revoke sessions
│           ├─ cookies.ts                 # set/clear ds_* cookies
│           ├─ request.ts                 # request metadata (UA/IP)
│           └─ google.ts                  # Google account linking/upsert
│
└─ server/
   ├─ .env
   ├─ prisma.config.ts
   ├─ prisma/
   │  ├─ schema.prisma                    # final data model
   │  ├─ seed.ts                          # seeded admin
   │  └─ migrations/
   │     └─ 20261026183811_init_auth/
   │        └─ migration.sql              # tables + CHECK constraints
   └─ src/
      ├─ index.ts                         # Express app + sample routes
      ├─ lib/jwt.ts                       # verify access token
      ├─ lib/prisma.ts                    # Prisma client (server app)
      ├─ middleware/auth.ts               # requireAuth / Role / Kind / ...
      └─ types/express.d.ts               # request.auth typing
```

---

## 2. Recommended reading order

If you want to understand the system from the ground up, open the files in this
order.

### Phase 1 — Data model

1. `server/prisma/schema.prisma`
2. `server/prisma/migrations/20261026183811_init_auth/migration.sql`
3. `server/prisma/seed.ts`
4. `client/src/lib/prisma.ts`
5. `server/src/lib/prisma.ts`

### Phase 2 — Auth core

6. `client/src/lib/auth/config.ts`
7. `client/src/lib/auth/types.ts`
8. `client/src/lib/auth/tokens.ts`
9. `client/src/lib/auth/password.ts`
10. `client/src/lib/auth/accounts.ts`
11. `client/src/lib/auth/session.ts`
12. `client/src/lib/auth/cookies.ts`
13. `client/src/lib/auth/request.ts`
14. `client/src/lib/auth/google.ts`
15. `client/src/lib/validation/auth.ts`

### Phase 3 — UI and actions

16. `client/src/app/signup/page.tsx` → `components/auth/SignupForm.tsx`
17. `client/src/app/login/page.tsx` → `components/auth/LoginForm.tsx`
18. `client/src/app/actions/auth.ts`
19. `client/src/app/dashboard/page.tsx` → `components/dashboard/PatientProfileForm.tsx`
20. `client/src/app/doctor/dashboard/page.tsx` → `components/dashboard/DoctorOnboardingForm.tsx`
21. `client/src/app/actions/onboarding.ts`
22. `client/src/components/dashboard/DashboardShell.tsx`

### Phase 4 — Route protection

23. `client/src/proxy.ts`
24. `client/src/lib/dal.ts`

### Phase 5 — Auth route handlers

25. `client/src/app/api/auth/refresh/route.ts`
26. `client/src/app/api/auth/reissue/route.ts`
27. `client/src/app/api/auth/logout/route.ts`
28. `client/src/app/api/auth/me/route.ts`
29. `client/src/app/api/auth/complete/route.ts`
30. `client/src/auth.ts`
31. `client/src/app/api/auth/[...nextauth]/route.ts`

### Phase 6 — Express API

32. `server/src/index.ts`
33. `server/src/middleware/auth.ts`
34. `server/src/lib/jwt.ts`

---

## 3. Flow 1 — Patient/doctor email/password signup

```text
client/src/app/signup/page.tsx
  reads ?role=user|doctor
  ↓
client/src/components/auth/SignupForm.tsx
  useActionState(signupAction)
  ↓
client/src/app/actions/auth.ts :: signupAction
  ↓
client/src/lib/validation/auth.ts :: signupSchema
  ↓
client/src/lib/auth/password.ts :: hashPassword
  ↓
client/src/lib/auth/accounts.ts :: accountExists
  ↓
client/src/lib/auth/accounts.ts :: createPatientAccount
                            or :: createDoctorAccount
  ↓
client/src/lib/prisma.ts → Postgres
  transaction:
    User or Doctor row
    LoginIdentity row (one email, exactly one owner)
  ↓
client/src/lib/auth/session.ts :: createSession
  ↓
client/src/lib/auth/tokens.ts
  signAccessToken  (15 min)
  signRefreshToken (7 days)
  ↓
client/src/lib/auth/cookies.ts :: setAuthCookies
  ds_access, ds_refresh, ds_session, ds_access_exp
  ↓
client/src/lib/prisma.ts → Postgres
  RefreshToken row (SHA-256 hash only)
  ↓
redirect → /dashboard (patient)
         → /doctor/dashboard (doctor)
```

Key details:

- The duplicate-email check exists in two layers:
  - `accountExists()` for a friendly message.
  - `LoginIdentity.email` primary key + `P2002` handling for the race.
- Patient signup does **not** ask for date of birth, gender, or photo.
- Doctor signup does **not** ask for license, specialization, experience, or phone.
- Both are collected after login.

---

## 4. Flow 2 — Email/password login

```text
client/src/app/login/page.tsx
  reads ?role, ?next, ?error
  ↓
client/src/components/auth/LoginForm.tsx
  useActionState(loginAction)
  hidden inputs: role, next
  ↓
client/src/app/actions/auth.ts :: loginAction
  ↓
client/src/lib/validation/auth.ts :: loginSchema
  ↓
client/src/lib/auth/accounts.ts :: findIdentityByEmail
  ↓
client/src/lib/auth/password.ts
  burnPasswordCheck()  ← unknown email (timing equalization)
  verifyPassword()     ← known email
  ↓
client/src/lib/auth/session.ts :: createSession
  ↓
client/src/lib/auth/tokens.ts + cookies.ts
  ↓
redirect → safeNext(next)
         → /doctor/dashboard
         → /admin/dashboard
         → /dashboard
```

Key details:

- `next` is validated by `safeNext()` before it is used.
- Wrong email and wrong password both return `Invalid email or password`.
- A Google-only account (no password hash) gets a friendly
  "Continue with Google" message.

---

## 5. Flow 3 — Protected page request (proxy + DAL)

This is the most important flow to understand. The proxy is optimistic; the DAL
is authoritative.

```text
Browser GET /dashboard
  ↓
client/src/proxy.ts
  ↓
client/src/lib/auth/config.ts
  cookie names: ds_access, ds_session
  ↓
client/src/lib/auth/tokens.ts :: verifyAccessToken
  ↓
  ├─ valid access token
  │    ↓
  │  role / kind / onboarding checks
  │    ↓
  │  NextResponse.next()
  │
  ├─ expired access + ds_session present
  │    ↓
  │  redirect /api/auth/refresh?next=/dashboard
  │    ↓
  │  client/src/app/api/auth/refresh/route.ts
  │    ↓
  │  client/src/lib/auth/session.ts :: rotateSession
  │    ↓
  │  new cookies written, redirect back to /dashboard
  │
  └─ no session
       ↓
     redirect /login?next=/dashboard
  ↓
client/src/app/dashboard/page.tsx
  ↓
client/src/lib/dal.ts :: getCurrentAccount
  ↓
client/src/lib/dal.ts :: getAppSession
  ↓
client/src/lib/auth/tokens.ts :: verifyAccessToken
  ↓
client/src/lib/auth/accounts.ts :: getAccountById
  ↓
  tokenVersion check (DB value vs JWT claim)
  ↓
  role / kind redirects
  ↓
client/src/components/dashboard/DashboardShell.tsx
client/src/components/dashboard/PatientProfileForm.tsx   (if onboarding incomplete)
```

Key details:

- `proxy.ts` never touches the database.
- `dal.ts` reads the DB and is the real authorization boundary.
- A bumped `tokenVersion` invalidates every previously issued access token.
- Incomplete onboarding may only see the role dashboard.

The doctor version is the same flow with:

- `client/src/app/doctor/dashboard/page.tsx`
- `client/src/components/dashboard/DoctorOnboardingForm.tsx`

The admin version is:

- `client/src/app/admin/dashboard/page.tsx`
- `client/src/lib/dal.ts :: requireAdmin`

---

## 6. Flow 4 — Refresh rotation and reuse detection

```text
client/src/app/api/auth/refresh/route.ts
  ↓
read ds_refresh cookie
  ↓
client/src/lib/auth/session.ts :: rotateSession
  ↓
client/src/lib/auth/tokens.ts
  verifyRefreshToken
  hashToken
  ↓
client/src/lib/prisma.ts → RefreshToken row lookup
  ↓
  ├─ row missing / expired
  │    → InvalidRefreshError
  │
  ├─ row revoked + replacedBy + age < 10s
  │    → RefreshRaceError
  │      GET: continue to next page
  │      POST: 401 REFRESH_RACE
  │
  ├─ row revoked + older than 10s
  │    → revokeFamily()
  │    → RefreshReuseError
  │
  ├─ row.kind mismatch
  │    → revokeFamily()
  │
  ├─ account missing
  │    → revokeFamily()
  │
  └─ tokenVersion mismatch
       → revokeFamily()
  ↓
client/src/lib/auth/accounts.ts :: getAccountById
  ↓
client/src/lib/auth/tokens.ts
  sign new access token
  sign new refresh token
  ↓
client/src/lib/prisma.ts transaction
  create new RefreshToken row
  old row: revokedAt + replacedBy
  ↓
client/src/lib/auth/cookies.ts :: setAuthCookies
  ↓
GET  → redirect to next
POST → JSON { ok: true }
```

Key details:

- Only the hash of the refresh token is stored.
- Rotation keeps the same `familyId`.
- Reuse after the grace window revokes the whole family.
- Any invalid refresh clears the browser cookies.

---

## 7. Flow 5 — Onboarding and token reissue

### Patient

```text
client/src/app/dashboard/page.tsx
  if !user.onboardingCompleted
  ↓
client/src/components/dashboard/PatientProfileForm.tsx
  useActionState(patientProfileAction)
  ↓
client/src/app/actions/onboarding.ts :: patientProfileAction
  ↓
client/src/lib/dal.ts :: getCurrentAccount
  ↓
client/src/lib/validation/auth.ts :: patientProfileSchema
  ↓
client/src/lib/prisma.ts → User update
  onboardingCompleted = true
  onboardingCompletedAt = now
  ↓
return { redirectTo: "/api/auth/reissue?next=..." }
  ↓
useEffect → window.location.assign(redirectTo)   # full navigation
  ↓
client/src/app/api/auth/reissue/route.ts
  ↓
client/src/lib/dal.ts :: getCurrentAccount   # fresh DB read
  ↓
client/src/lib/auth/session.ts :: revokeRefreshToken
  revokes old ds_refresh family
  ↓
client/src/lib/auth/session.ts :: createSession
  new access token has onboarded: true
  ↓
client/src/lib/auth/tokens.ts + cookies.ts
  ↓
redirect /dashboard?completed=1
```

### Doctor

Same flow with:

- `client/src/app/doctor/dashboard/page.tsx`
- `client/src/components/dashboard/DoctorOnboardingForm.tsx`
- `client/src/app/actions/onboarding.ts :: doctorOnboardingAction`
- `client/src/lib/validation/auth.ts :: doctorOnboardingSchema`
- redirect `/doctor/dashboard?completed=1`

Why the extra `/api/auth/reissue` step?

- `ds_refresh` is scoped to `/api/auth`.
- A Server Action running on `/dashboard` cannot read that cookie.
- The reissue route can read it, revoke the old family, and issue a new session.
- The form does a full navigation so the route handler's redirect is followed
  correctly.

---

## 8. Flow 6 — Logout

```text
client/src/components/dashboard/DashboardShell.tsx
  <form action="/api/auth/logout" method="post">
    hidden redirect=/login
  ↓
client/src/app/api/auth/logout/route.ts
  ↓
read redirect from form data or query
  ↓
client/src/lib/auth/session.ts :: revokeCurrentSession
  ↓
cookies().get(ds_refresh)
  ↓
client/src/lib/auth/session.ts :: revokeRefreshToken
  ↓
client/src/lib/auth/session.ts :: revokeFamily
  ↓
client/src/lib/auth/cookies.ts :: clearAuthCookies
  ↓
303 redirect → /login
```

Why a form POST instead of a Server Action?

- Same cookie-scope reason as onboarding.
- `/api/auth/logout` is under `/api/auth`, so the refresh cookie is sent and the
  token family can actually be revoked.
- A Server Action on `/dashboard` could clear cookies but not revoke the DB
  family.

---

## 9. Flow 7 — Google OAuth

```text
client/src/components/auth/LoginForm.tsx
client/src/components/auth/SignupForm.tsx
  Google button form
  ↓
client/src/app/actions/auth.ts :: googleStartAction
  ↓
client/src/lib/auth/cookies.ts
  setPendingRoleCookie(user|doctor)
  setPendingNextCookie(next) or clearPendingNextCookie()
  ↓
client/src/auth.ts :: signIn("google", { redirectTo: "/api/auth/complete" })
  ↓
Google consent screen
  ↓
client/src/app/api/auth/[...nextauth]/route.ts
  ↓
client/src/auth.ts :: callbacks.signIn
  ↓
client/src/lib/auth/cookies.ts :: readPendingRoleCookie
  ↓
client/src/lib/auth/google.ts :: handleGoogleSignIn
  ↓
client/src/lib/prisma.ts
  Account / DoctorAccount lookup
  LoginIdentity lookup by email
  ↓
  ├─ already linked → touch user/doctor
  ├─ email exists   → link Google account to that user/doctor
  └─ new email      → create User or Doctor
                       + LoginIdentity
                       + Account or DoctorAccount
  ↓
client/src/auth.ts :: callbacks.jwt
  token.appSub  = our account id
  token.appKind = USER | DOCTOR
  ↓
client/src/auth.ts :: callbacks.session
  session.appSub / session.appKind
  ↓
client/src/app/api/auth/complete/route.ts
  auth() reads the 60-second Auth.js session
  ↓
client/src/lib/auth/accounts.ts :: getAccountById
  ↓
client/src/lib/auth/session.ts :: createSession
  ↓
client/src/lib/auth/tokens.ts + cookies.ts
  ↓
clear pending role/next cookies
  ↓
redirect → safeNext(next) ?? role dashboard
```

Key details:

- Auth.js proves the Google identity; it never authorizes the app.
- The Auth.js session lives for 60 seconds and is a one-time handoff.
- After `/api/auth/complete`, only `ds_access` / `ds_refresh` are used.
- Google email must be verified (`email_verified`).
- One account per email is enforced by `LoginIdentity`.

---

## 10. Flow 8 — Express API request

```text
client/src/lib/api.ts :: apiFetch
  proactive refresh if ds_access_exp is near
  fetch http://localhost:5000/api/...
  retry once on 401
  ↓
server/src/index.ts
  cors + express.json + cookieParser + morgan
  ↓
server/src/middleware/auth.ts :: requireAuth
  reads ds_access cookie or Authorization: Bearer
  ↓
server/src/lib/jwt.ts :: verifyAccessToken
  ↓
server/src/middleware/auth.ts
  requireKind("USER" | "DOCTOR")
  requireRole("PATIENT" | "DOCTOR" | "ADMIN")
  requireOnboarded
  requireVerifiedDoctor
  ↓
server/src/index.ts route handler
```

Sample routes:

| Route | Guards |
|---|---|
| `GET /api/health` | public |
| `GET /api/me` | `requireAuth` |
| `GET /api/patient/overview` | `requireAuth` → `requireKind("USER")` → `requireOnboarded` → `requireRole("PATIENT")` |
| `GET /api/doctor/overview` | `requireAuth` → `requireKind("DOCTOR")` → `requireOnboarded` → `requireRole("DOCTOR")` |
| `GET /api/doctor/verified` | `requireAuth` → `requireKind("DOCTOR")` → `requireVerifiedDoctor` |

`requireVerifiedDoctor` is the only Express guard that queries the database
(`server/src/lib/prisma.ts`) to check `Doctor.verified` and `tokenVersion`.

---

## 11. Where the database is touched

| File | Tables |
|---|---|
| `client/src/lib/auth/accounts.ts` | `User`, `Doctor`, `LoginIdentity` |
| `client/src/lib/auth/google.ts` | `User`, `Doctor`, `LoginIdentity`, `Account`, `DoctorAccount` |
| `client/src/lib/auth/session.ts` | `RefreshToken`, `User.tokenVersion`, `Doctor.tokenVersion` |
| `client/src/app/actions/onboarding.ts` | `User`, `Doctor` onboarding fields |
| `server/prisma/seed.ts` | `User` (admin) |
| `server/src/middleware/auth.ts` | `Doctor.verified`, `Doctor.tokenVersion` |
| `client/src/app/api/auth/me/route.ts` | read via `getCurrentAccount` |

---

## 12. File reference

### Foundation

| File | Responsibility |
|---|---|
| `server/prisma/schema.prisma` | Final data model and relations |
| `server/prisma/migrations/.../migration.sql` | Tables, indexes, CHECK constraints |
| `server/prisma/seed.ts` | Seeds the admin account |
| `client/src/lib/prisma.ts` | Prisma client for Next.js |
| `server/src/lib/prisma.ts` | Prisma client for Express |

### Auth core

| File | Responsibility |
|---|---|
| `client/src/lib/auth/config.ts` | TTLs, cookie names, JWT issuer/audience, secrets |
| `client/src/lib/auth/types.ts` | `AccessClaims`, `RefreshClaims`, `SessionAccount` |
| `client/src/lib/auth/tokens.ts` | Sign/verify JWTs, SHA-256 token hash, token IDs |
| `client/src/lib/auth/password.ts` | bcrypt hash/verify and dummy check |
| `client/src/lib/auth/accounts.ts` | Email normalization, account creation/lookup |
| `client/src/lib/auth/session.ts` | Create, rotate, revoke sessions |
| `client/src/lib/auth/cookies.ts` | Set/clear `ds_*` cookies |
| `client/src/lib/auth/request.ts` | User-Agent and IP metadata |
| `client/src/lib/auth/google.ts` | Google identity linking and account upsert |
| `client/src/lib/validation/auth.ts` | Zod schemas and field-error mapping |

### UI and actions

| File | Responsibility |
|---|---|
| `client/src/app/login/page.tsx` | Login page, notices, role/next params |
| `client/src/components/auth/LoginForm.tsx` | Login form + Google button |
| `client/src/app/signup/page.tsx` | Signup page, role param |
| `client/src/components/auth/SignupForm.tsx` | Signup form + Google button |
| `client/src/app/actions/auth.ts` | Signup, login, Google start actions |
| `client/src/app/dashboard/page.tsx` | Patient dashboard / profile gate |
| `client/src/components/dashboard/PatientProfileForm.tsx` | Patient onboarding form |
| `client/src/app/doctor/dashboard/page.tsx` | Doctor dashboard / onboarding gate |
| `client/src/components/dashboard/DoctorOnboardingForm.tsx` | Doctor onboarding form |
| `client/src/app/actions/onboarding.ts` | Save profile/details, return reissue URL |
| `client/src/components/dashboard/DashboardShell.tsx` | Shared header, badge, logout form |

### Guards and route handlers

| File | Responsibility |
|---|---|
| `client/src/proxy.ts` | Optimistic JWT/role/onboarding guard |
| `client/src/lib/dal.ts` | Authoritative session + DB guards |
| `client/src/app/api/auth/refresh/route.ts` | Refresh rotation |
| `client/src/app/api/auth/reissue/route.ts` | New session after onboarding |
| `client/src/app/api/auth/logout/route.ts` | Revoke family + clear cookies |
| `client/src/app/api/auth/me/route.ts` | Current account JSON |
| `client/src/app/api/auth/complete/route.ts` | Auth.js → custom JWT handoff |
| `client/src/auth.ts` | Google provider and one-time Auth.js session |
| `client/src/app/api/auth/[...nextauth]/route.ts` | Auth.js HTTP handlers |

### Express

| File | Responsibility |
|---|---|
| `server/src/index.ts` | Express app, CORS, routes |
| `server/src/middleware/auth.ts` | Auth/role/kind/onboarding/verified guards |
| `server/src/lib/jwt.ts` | Access token verification |
| `server/src/lib/prisma.ts` | Prisma client |
| `server/src/types/express.d.ts` | `request.auth` typing |

---

## 13. Quick lookup — "I want to change X"

| I want to change… | Open… |
|---|---|
| Access/refresh lifetime | `client/src/lib/auth/config.ts` |
| Cookie names or refresh cookie path | `client/src/lib/auth/config.ts` + `cookies.ts` |
| JWT claims | `client/src/lib/auth/types.ts` + `tokens.ts` + `server/src/lib/jwt.ts` |
| Password rules | `client/src/lib/validation/auth.ts` + `password.ts` |
| Duplicate-email rule | `client/src/lib/auth/accounts.ts` + `server/prisma/schema.prisma` |
| Patient onboarding fields | `server/prisma/schema.prisma` + `validation/auth.ts` + `actions/onboarding.ts` + `PatientProfileForm.tsx` |
| Doctor onboarding fields | `server/prisma/schema.prisma` + `validation/auth.ts` + `actions/onboarding.ts` + `DoctorOnboardingForm.tsx` |
| Page access rules | `client/src/proxy.ts` + `client/src/lib/dal.ts` |
| API access rules | `server/src/middleware/auth.ts` + `server/src/index.ts` |
| Google account linking | `client/src/auth.ts` + `client/src/lib/auth/google.ts` |
| Logout behavior | `client/src/app/api/auth/logout/route.ts` + `DashboardShell.tsx` |
| Onboarding reissue | `client/src/app/api/auth/reissue/route.ts` + `actions/onboarding.ts` |
| Admin seed | `server/prisma/seed.ts` |
| DB tables/relations | `server/prisma/schema.prisma` + migration SQL |

---

## 14. Generated files — do not edit

- `client/src/generated/prisma/` is generated by Prisma. It is gitignored.
- `server/node_modules/@prisma/client` is generated by Prisma.
- After changing `server/prisma/schema.prisma`, run:

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

or from the client:

```bash
cd client
npm run db:generate
```

---

## 15. One-line mental model

```text
Signup/Login  → actions/auth.ts → accounts.ts → session.ts → tokens.ts → cookies.ts
Page request  → proxy.ts → (refresh route if needed) → dal.ts → page.tsx
Onboarding    → actions/onboarding.ts → reissue route → session.ts → cookies.ts
Logout        → DashboardShell form → logout route → session.ts → cookies.ts
Google        → auth.ts → google.ts → complete route → session.ts → cookies.ts
Express       → index.ts → middleware/auth.ts → lib/jwt.ts
```
