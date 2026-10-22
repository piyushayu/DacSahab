# DacSahab — Project Architecture & Environment Guide

Welcome to the **DacSahab** repository. This document explains the project architecture, environment variable management, the Prisma + PostgreSQL setup, and how each component connects.

---

## 1. Why Did Source Control / Git Show "10k" Changes?

### The Reason:
When we installed the server dependencies, `npm` generated the `server/node_modules/` folder containing hundreds of npm packages and over 10,000 files. 

Because the repository root did not yet have a top-level `.gitignore` file, your Git tracking and code editor (VS Code / Antigravity IDE) recursively traversed all 10,000+ files inside `server/node_modules` as pending untracked files.

### The Fix:
We created a root [`.gitignore`](file:///c:/Users/Piyush/Dacsahab/.gitignore) (and [`server/.gitignore`](file:///c:/Users/Piyush/Dacsahab/server/.gitignore)) that explicitly tells Git to ignore:
- `node_modules/` and `*/node_modules/`
- `.next/` build outputs
- `dist/` compile outputs
- `.env` and `.env.local` secret files

Now Git and your Source Control tab only track your source code.

---

## 2. Project Directory Structure

```text
Dacsahab/
├── .gitignore               # Ignores dependencies, builds, and secrets across the repo
├── package.json             # Root runner scripts (run client & server from root)
├── README.md                # Project introduction
├── PROJECT_GUIDE.md         # This comprehensive documentation file
│
├── client/                  # Frontend Application
│   ├── .env.example         # Client environment variable template
│   ├── .env.local           # Active client environment variables
│   ├── package.json         # Next.js dependencies (React, Tailwind CSS, TypeScript)
│   ├── tsconfig.json        # Frontend TypeScript config
│   └── src/
│       └── app/             # Next.js App Router pages and layout
│
└── server/                  # Backend Application
    ├── .env.example         # Server environment variable template
    ├── .env                 # Active server environment variables (secrets)
    ├── package.json         # Express dependencies (Prisma, Cors, Dotenv, TS, etc.)
    ├── tsconfig.json        # Backend TypeScript config
    └── prisma/
        └── schema.prisma    # Database schema (PostgreSQL models with Prisma)
```

---

## 3. How Environment Variables Work

### A. Client Environment (`client/.env.local`)
Next.js uses special conventions for environment variables:
- **`NEXT_PUBLIC_` prefix**: Any variable beginning with `NEXT_PUBLIC_` (such as `NEXT_PUBLIC_API_URL=http://localhost:5000/api`) is exposed to the browser client.
- Variables **without** `NEXT_PUBLIC_` are kept private and accessible only during Server-Side Rendering (SSR) or Route Handlers in Next.js.
- **`.env.local`** is automatically loaded by Next.js and is ignored by Git to avoid leaking secrets.

### B. Server Environment (`server/.env`)
Express loads environment variables using the `dotenv` package (`import 'dotenv/config'`):
- **`PORT`**: The port Express listens on (default: `5000`).
- **`NODE_ENV`**: `development` or `production`.
- **`CLIENT_URL`**: Allowed origin for CORS (e.g., `http://localhost:3000`).
- **`DATABASE_URL`**: The PostgreSQL connection string used by Prisma.
  ```text
  DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public"
  ```
  *Example (local Postgres):* `postgresql://postgres:postgres@localhost:5432/dacsahab?schema=public`

---

## 4. How Express, Prisma ORM, and PostgreSQL Work Together

```mermaid
graph LR
    NextClient["Next.js Client (Port 3000)"] -- "HTTP / JSON REST" --> ExpressServer["Express API (Port 5000)"]
    ExpressServer -- "Prisma Client (Type-safe Queries)" --> PrismaORM["Prisma ORM"]
    PrismaORM -- "TCP Connection (DATABASE_URL)" --> PostgreSQL[("PostgreSQL Database")]
```

1. **Schema Definition ([`schema.prisma`](file:///c:/Users/Piyush/Dacsahab/server/prisma/schema.prisma))**:
   - Defines your models (e.g., `User`, `Doctor`, `Appointment`, `Review`) with types and relations.
   - Specifies `provider = "postgresql"` and reads the `DATABASE_URL` from `server/.env`.
2. **Prisma Client (`@prisma/client`)**:
   - Generates fully type-safe TypeScript methods based on your models (e.g., `prisma.doctor.findMany()`, `prisma.appointment.create()`).
3. **Database Migrations (`prisma migrate dev`)**:
   - Compares your `schema.prisma` against your PostgreSQL database and automatically generates and runs SQL migrations to create the tables.
4. **Prisma Studio (`prisma studio`)**:
   - Provides a visual web GUI to inspect and manipulate your database records directly.

---

## 5. Development Commands

### From the Root Directory:
- **Run Next.js Frontend:**
  ```bash
  npm run client
  ```
  *(Starts Next.js on `http://localhost:3000`)*

- **Run Express Backend:**
  ```bash
  npm run server
  ```
  *(Starts Express on `http://localhost:5000` with hot-reloading)*

- **Prisma Commands (run from root):**
  - Generate Prisma Client: `npm run prisma:generate`
  - Run Migrations: `npm run prisma:migrate`
  - Open Database GUI: `npm run prisma:studio`

---

## 6. Next Steps for You to Start Coding

1. **Start PostgreSQL**: Make sure your local PostgreSQL service is running (or paste a cloud connection URL like Supabase, Neon, or NeonDB into [`server/.env`](file:///c:/Users/Piyush/Dacsahab/server/.env)).
2. **Run Initial Migration**:
   ```bash
   npm run prisma:migrate
   ```
3. **Write Your API**: Build your Express routes, controllers, and services inside `server/src/`.
4. **Write Your UI**: Build your medical consultation pages and components using React, Tailwind CSS, and TypeScript inside `client/src/app/`.
