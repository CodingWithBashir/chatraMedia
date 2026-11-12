# Chatra Media

Chatra is organized as a small TypeScript monorepo:

- **`client/`** — Next.js App Router, React, Tailwind CSS, and the Chatra web experience. The existing Chatra screens and styles live in `client/src/`; Next.js provides the frontend host and keeps the current screen URLs working.
- **`server/`** — Node.js/Express API. It verifies Supabase access tokens and performs user-scoped database operations using Supabase's publishable/anon key and row-level security. It never needs a service-role key.
- **`supabase/`** — Supabase project config and SQL migrations.

## Local development

Requirements: Node.js 20.9+ and npm.

```sh
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
npm run dev
```

The web client runs at <http://localhost:3000>; the standalone Express API listens on <http://localhost:4001>. The Next.js App Router also exposes same-origin Node.js handlers at `/api/health`, `/api/me`, and `/api/posts`, so the deployed Next app does not depend on a localhost API process. Post creation uses the authenticated user's Supabase access token and RLS, with a direct Supabase fallback if needed.

```sh
npm run typecheck
npm run build
npm run start
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public Supabase browser credentials. The API uses the same publishable/anon key with the user's bearer token, so Supabase RLS remains authoritative.
- `PORT` and `CHATRA_CLIENT_ORIGIN` configure the optional standalone Express API listener and its direct CORS origin.

Never put a Supabase service-role key in a `NEXT_PUBLIC_*` variable or commit it. `.env.local` is ignored by Git.

## Deployment notes

For Vercel, link the repository and set the project root to `client/` (or the repository root with build command `npm run build --workspace @chatra/client`). Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel project for production and preview. The App Router API routes run as Vercel Node.js functions and do not require the standalone Express service. Ensure the migrations in `supabase/migrations/` have been applied to the configured Supabase project.
