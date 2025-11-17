# Development setup (local)

This project expects a Postgres-compatible database in production. For local development you can either provide a `DATABASE_URL` or use the built-in in-memory fallback which requires no setup.

## Option A (recommended): provide a local database

1. Copy `.env.example` to `.env` and edit `DATABASE_URL` with your database connection string (postgres://user:pass@localhost:5432/dbname).

2. Start the dev server:

```powershell
copy .env.example .env
# edit .env to set DATABASE_URL, then:
npm install
npm run dev
```

## Option B: run without a database (fast, development only)

If you don't want to provision a database, the server will automatically use an in-memory fallback when `DATABASE_URL` is not set and `NODE_ENV` === `development`.

To run this way:

```powershell
npm install
npm run dev
```

Notes:
- The in-memory fallback persists only while the server is running, and data is lost when the process stops.
- Some features that depend on complex DB behavior may not behave exactly like the real DB. The fallback is intended to let the UI load and exercise basic flows.
