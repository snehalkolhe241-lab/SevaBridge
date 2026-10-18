# SevaBridge

NGO campaign and pledge tracker. Visitors discover needs and record item or money pledges. There is no payment gateway. The NGO confirms handover offline.

This is a student prototype. Planning notes live in `project_context_sevabridge.md` and `IMPLEMENTATION_PLAN.md`.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
```

The public pages and the NGO login screen run without a database. Protected NGO pages redirect to login until sign-in is connected.

## Environment

Copy `.env.example` to `.env.local` when you have a Supabase project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not commit real keys. Do not put the service-role key in frontend env.
