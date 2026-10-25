# Potluck

One page for your party: when, where, and who brings what. Guests get a link
and one easy password. No accounts. Built on
[tool-template](https://github.com/An-Be/tool-template).

## Status

- **M1**: create a party, host link, guest password gate, Holiday Classic + Plain themes
- **M2**: needs list, claim/unclaim, still-needed progress
- **M3**: RSVP, attendee list, host edit mode, remaining themes
- **M4**: .ics download, share text, TabMath link-out

## Run it

```bash
npm install
cp .env.example .env      # app-role pooled + direct Neon URLs
npx prisma migrate deploy # with the owner role, first time only
npm run dev
```

Setup (Neon, app role, Vercel, PostHog) follows
[`docs/new-tool.md`](./docs/new-tool.md). Project rules and the access model
are in [`AGENTS.md`](./AGENTS.md).

## Commands

```bash
npm run dev         # dev server
npm run build       # prisma generate + drift check + next build
npm run typecheck   # next typegen + tsc
npm run lint
npm test            # vitest
```
