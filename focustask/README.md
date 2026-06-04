# DeepSession

A Next.js productivity dashboard: task management, Pomodoro timer, and focus analytics backed by Supabase.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with Google OAuth enabled

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

   - New project: run [`supabase_schema.sql`](./supabase_schema.sql)
   - Existing DB with the old `duration_seconds > 0` constraint: also run [`migrations/001_task_done_zero_duration.sql`](./migrations/001_task_done_zero_duration.sql)

4. Configure Google OAuth in Supabase (Authentication → Providers) and add your site URL plus `http://localhost:3000/auth/callback` as redirect URLs.

5. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | Run ESLint               |
| `npm test`     | Run validation unit tests|

## Deploy

Build and deploy to any Node-compatible host (e.g. Vercel). Set the same `NEXT_PUBLIC_*` env vars in your deployment environment and add your production callback URL in Supabase.
