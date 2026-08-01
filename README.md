# PokeWiki

## Environment

Create the local environment file before starting the app:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL. This is intentionally available to the browser.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key used by browser authentication. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted.
- `SUPABASE_SECRET_KEY`: server-only Supabase secret key. The legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted.

Never prefix the secret key with `NEXT_PUBLIC_`. Configure the same variables in the production deployment environment.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Maintenance Scripts

Node does not automatically load Next.js environment files. Run maintenance scripts explicitly with the local environment file:

```bash
node --env-file=.env.local scripts/checkDescriptions.mjs
```

All database mutations execute in authenticated Server Actions or protected Route Handlers. The service-role/secret client is guarded with `server-only` and cannot be imported into a Client Component.
