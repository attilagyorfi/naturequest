# NatureQuest

NatureQuest is a gamified education MVP built with Next.js 16, Auth.js, Prisma, PostgreSQL, and Tailwind CSS.

## Local Setup

Install dependencies:

```bash
corepack pnpm install
```

Apply database migrations before testing authenticated flows:

```bash
corepack pnpm prisma migrate deploy
corepack pnpm prisma generate
```

Run the development server:

```bash
corepack pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is busy, Next.js will print the port it selected.

## Production Smoke Test

Build the app:

```bash
corepack pnpm run build
```

For a local `next start` smoke test, Auth.js needs the local host to be trusted:

```powershell
$env:AUTH_TRUST_HOST = "true"
corepack pnpm exec next start -p 3010
```

Then open [http://localhost:3010](http://localhost:3010) and verify:

- register a new user
- complete onboarding
- land on the dashboard
- open a quest
- finish the quest and see reward feedback

## Checks

```bash
corepack pnpm run test:naturequest
corepack pnpm run test:mmi
corepack pnpm run lint
corepack pnpm run build
```

`test:naturequest` runs with one Node test worker for stability on Windows.
