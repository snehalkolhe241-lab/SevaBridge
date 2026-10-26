# SevaBridge

SevaBridge lets a community organisation publish what it needs. Anyone can find a campaign and pledge items or money. Nothing is paid in the app. The organisation confirms the handover in person, and the campaign page keeps **pledged** and **received** separate.

The sample campaigns are fictional.

## How it works

1. The organisation publishes a campaign for items, money, or both.
2. A visitor pledges without creating an account.
3. The organisation records what actually arrived and can post an update. A pledge stays a pledge until then.

## Visitors

- Browse active campaigns, and search or filter them.
- Pledge items or an amount.
- Read updates on the campaign page.

A visitor never sees someone else’s contact details, and cannot mark a pledge as received.

## Organisations

- Sign in to publish and edit campaigns.
- See who pledged, and record what was received.
- Post an update that appears on the public page.

A draft stays off the public site. There is no online payment, no donor account, and no self-signup for a new organisation.

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

To load campaigns, copy `.env.example` to `.env.local` and add your Supabase project URL and anon key. Database setup is in [docs/setup.md](docs/setup.md).

## Built with

React, TypeScript, Vite, React Router, and Supabase.
