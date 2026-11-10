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

The web client runs at <http://localhost:3000>; the API listens on <http://localhost:4001>. The Next.js `/api/*` rewrite keeps browser requests same-origin and forwards them to the Node API. The client uses the API to create posts; if the API is unavailable, it falls back to the Supabase client with the signed-in user's session and RLS.

```sh
npm run typecheck
npm run build
npm run start
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public Supabase browser credentials. The API uses the same publishable/anon key with the user's bearer token, so Supabase RLS remains authoritative.
- `CHATRA_API_INTERNAL_URL` optionally changes the server-side rewrite target (default `http://127.0.0.1:4001`).
- `PORT` and `CHATRA_CLIENT_ORIGIN` configure the API listener and optional direct CORS origin.

Never put a Supabase service-role key in a `NEXT_PUBLIC_*` variable or commit it. `.env.local` is ignored by Git.

## Deployment notes

Deploy `client/` as the Next.js application and `server/` as a Node.js service. Configure the same Supabase URL and publishable key in both deployments, then set `CHATRA_API_INTERNAL_URL` in the Next deployment to the private or public URL of the API service. Run the migrations in `supabase/migrations/` against the target Supabase project before enabling database-backed features.
