# DeepSession (FocusTask)

A Pomodoro-style focus timer with task management and session analytics. Built with **Next.js** and **Supabase** for per-user authentication, data storage, and row-level security.

**Repository:** [github.com/Rainzy21/RPL_UAS](https://github.com/Rainzy21/RPL_UAS)

## Authors

| Name | GitHub |
|------|--------|
| Rainzy21 | [@Rainzy21](https://github.com/Rainzy21) |
| Rivoldy Voldy | [@epo33m](https://github.com/epo33m) |

## Features

- **Google OAuth** sign-in via Supabase Auth
- **Task management** — priorities, due dates, estimated hours, completion tracking
- **Focus timer** — focus, short break, and long break modes with persisted state across reloads
- **Analytics** — daily focus time, weekly chart, activity log, and day streak
- **Per-user data** — API routes and Supabase RLS scoped to the signed-in user

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| Language | TypeScript 5 |

## Dependencies

All npm packages live in the `focustask/` app directory.

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.7 | React framework, App Router, API routes |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `@supabase/ssr` | ^0.10.3 | Supabase client for server/client components and cookies |

`@supabase/supabase-js` is included transitively through `@supabase/ssr` (do not add it separately).

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | Type checking |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.2.7 | Next.js ESLint rules |
| `tailwindcss` | ^4 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4 | PostCSS integration for Tailwind |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |

## Prerequisites

Before you start, install:

1. **[Node.js 20+](https://nodejs.org/)** — LTS recommended (`node -v` should show v20 or newer)
2. **[npm](https://www.npmjs.com/)** — ships with Node.js (`npm -v`)
3. **[Git](https://git-scm.com/)** — to clone the repository
4. A **[Supabase](https://supabase.com/)** account and project (free tier is enough)
5. A **Google Cloud OAuth client** — for Google sign-in (configured inside Supabase)

Optional for deployment:

- **[Vercel](https://vercel.com/)** account (or any Node.js host that supports Next.js)

## Repository structure

```
RPL_UAS/
├── LICENSE                 # MIT license
├── README.md               # This file
└── focustask/              # Next.js application (run all npm commands here)
    ├── app/                # Pages, layouts, API routes, auth callback
    ├── components/         # React UI components
    ├── hooks/              # Client hooks (timer, tasks, focus logs)
    ├── lib/                # Validation, API errors, analytics helpers
    ├── utils/supabase/     # Supabase SSR/browser clients
    ├── supabase_schema.sql # Full DB schema for new Supabase projects
    ├── supabase/migrations/# Incremental SQL migrations
    ├── package.json        # Dependencies and scripts
    └── .github/workflows/  # CI (lint, audit, build)
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Rainzy21/RPL_UAS.git
cd RPL_UAS/focustask
```

### 2. Install npm dependencies

```bash
npm install
```

This reads `package.json` and installs everything listed under **Dependencies** above.

### 3. Create environment variables

Create a file named `.env.local` in the `focustask/` directory:

```bash
# focustask/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → **Project Settings** → **API** → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → **Project Settings** → **API** → **anon public** key |

> **Note:** Never commit `.env.local`. It is already ignored by git.

### 4. Set up the Supabase database

#### New project (recommended)

1. Open your Supabase project → **SQL Editor**
2. Copy the contents of [`focustask/supabase_schema.sql`](focustask/supabase_schema.sql)
3. Run the script

This creates:

- `tasks` and `focus_logs` tables
- Indexes for common queries
- Row Level Security (RLS) policies tied to `auth.uid()`

#### Existing database (upgrade)

If your database was created before `user_id` columns existed, run [`focustask/supabase/migrations/001_auth_rls.sql`](focustask/supabase/migrations/001_auth_rls.sql) in the SQL Editor instead of re-running the full schema.

### 5. Configure Google OAuth

#### In Supabase

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google and note the **Callback URL** shown by Supabase (e.g. `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`)

#### In Google Cloud Console

1. Create or open a project at [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Add **Authorized redirect URIs**: the Supabase callback URL from step 5.1
5. Copy the **Client ID** and **Client Secret** into Supabase Google provider settings

#### Redirect URLs for the app

In Supabase → **Authentication** → **URL Configuration**, add:

| Environment | Site URL | Redirect URLs |
|-------------|----------|---------------|
| Local dev | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://your-domain.com` | `https://your-domain.com/auth/callback` |

The app exchanges the OAuth code at `app/auth/callback/route.ts` and redirects to the dashboard.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should be redirected to `/login`; sign in with Google to reach the dashboard.

## npm scripts

Run these from the `focustask/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server (hot reload) |
| `npm run build` | Production build (includes ESLint; must pass with 0 errors) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

### Verify the project

```bash
npm run lint    # expect 0 errors
npm run build   # must complete successfully
```

## Production deployment

### Build locally

```bash
cd focustask
npm run build
npm run start
```

### Deploy to Vercel (recommended)

1. Import the GitHub repository in [Vercel](https://vercel.com/new)
2. Set the **Root Directory** to `focustask`
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
5. Update Supabase **Site URL** and **Redirect URLs** to your production domain (see step 5 above)

### Security headers

Production responses include security headers configured in `focustask/next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, etc.) and `poweredByHeader` is disabled.

## API overview

All API routes require an authenticated Supabase session. Unauthenticated requests receive `401 Unauthorized`.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/tasks` | List tasks for the current user |
| `POST` | `/api/tasks` | Create a task (validated server-side) |
| `PATCH` | `/api/tasks/[id]` | Update whitelisted task fields only |
| `DELETE` | `/api/tasks/[id]` | Delete a task |
| `GET` | `/api/focus-logs` | Analytics summary + recent activity rows |
| `POST` | `/api/focus-logs` | Log a focus session (validated server-side) |

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Redirect loop or stuck on login | Wrong Supabase redirect URL | Match `http://localhost:3000/auth/callback` (or prod URL) in Supabase URL config |
| Google sign-in fails | OAuth client misconfigured | Check Google client ID/secret in Supabase; redirect URI must match Supabase callback |
| Empty tasks after login | RLS or missing `user_id` | Run `supabase_schema.sql` (new) or `001_auth_rls.sql` (upgrade) |
| `npm run build` fails | ESLint errors | Run `npm run lint` and fix reported issues |
| Missing env vars at build | CI/host without Supabase keys | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host dashboard |

## Continuous integration

GitHub Actions workflow at `focustask/.github/workflows/ci.yml` runs on push/PR to `main` or `master`:

- `npm ci`
- `npm run lint`
- `npm audit --audit-level=high`
- `npm run build` (with placeholder Supabase env vars)

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE).

Copyright (c) 2026 Rainzy21, epo33m
