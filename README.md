# Front-End-AntiGinx

A small Next.js front-end (TypeScript) for the AntiGinx project. Provides simple UI components for URL scanning, security reports and a threat meter — intended to be used with an AntiGinx backend API.

## Tech stack

- Next.js (v16)
- React (v19)
- TypeScript (v5+)
- Tailwind CSS (v4) + PostCSS

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run in development mode:

```bash
npm run dev
```

Open http://localhost:3000 in your browser (default Next.js port).

Notes:
- If the app needs an API URL or other runtime config, add them to `.env.local` (for example `NEXT_PUBLIC_API_URL`).
- Common scripts are `dev`, `build` and `start` (see `package.json`).
