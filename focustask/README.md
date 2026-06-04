# DeepSession (FocusTask)

A Pomodoro-style focus timer with task management and session analytics, built with Next.js and Supabase.

## Features

- Google OAuth via Supabase Auth
- Task list with priorities, due dates, and completion tracking
- Focus / short break / long break timer with persisted state
- Analytics: daily focus time, weekly chart, activity log, day streak

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with Google OAuth configured

## Setup

1. Install dependencies:

```bash
cd focustask
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project settings.

3. Apply the database schema in the Supabase SQL Editor:

```bash
# Run supabase_schema.sql
```

For existing databases that predate `user_id` columns, see `supabase/migrations/001_auth_rls.sql`.

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (runs ESLint) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy

Deploy to Vercel (or any Node host). Set the same `NEXT_PUBLIC_*` env vars in the hosting dashboard and configure the Supabase redirect URL to `https://your-domain/auth/callback`.

## Project structure

- `app/` — Next.js App Router pages and API routes
- `components/` — UI components
- `hooks/` — Client hooks (timer, tasks, focus logs)
- `lib/` — Validation, API helpers, analytics
- `utils/supabase/` — Supabase SSR clients
