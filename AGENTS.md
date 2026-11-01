<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

> **Everything below is project-owned and must stay OUTSIDE the markers above.**
> `next dev` replaces everything between `BEGIN:nextjs-agent-rules` and
> `END:nextjs-agent-rules` whenever it doesn't match. Text before and after is kept.

# Project rules

This repo follows **tool-template** (github.com/An-Be/tool-template), the shared
base for Andrea's tiny tools. Tool-specific context goes in the "This tool"
section at the bottom; everything above it is shared and should stay in sync
with the template.

## Never commit or push without asking

Do not run `git commit` or `git push` on your own initiative, even for a small,
verified fix. Make the change, verify it, say what you'd commit, and ask. Every
time. A push to `main` deploys to production on Vercel.

## Stack

- **Next.js 16** (App Router, Turbopack, RSC by default), **React 19**, **TypeScript 5** strict
- **Tailwind CSS 4**, CSS-first: tokens live in `src/app/globals.css` under `@theme`. No `tailwind.config`.
- **Hand-rolled UI primitives** in `src/components/ui/` (no shadcn, no Base UI). `cn()` from `src/lib/utils.ts`, variants with `cva`.
- **Postgres on Neon** + **Prisma 7** with `@prisma/adapter-pg`
- **Zod 4** for every external input
- **Vitest** for pure logic
- **Vercel**, region `cle1` (next to Neon `aws-us-east-2`)

### Version rules that override older training data

- `middleware.ts` is **`src/proxy.ts`** in Next 16. Node runtime only.
- `params`, `searchParams`, `cookies()` and `headers()` are **async**. `await` them.
- Page props are typed with the generated global `PageProps<"/route/[param]">`
  (run `next typegen`, which `npm run typecheck` does).
- Prisma 7: generator is `prisma-client` (not `prisma-client-js`), output
  `src/lib/generated/prisma` (gitignored). Import from
  `@/lib/generated/prisma/client`, **never** `@prisma/client`. The datasource URL
  is in `prisma.config.ts`, not `schema.prisma`. A driver adapter is mandatory
  (`src/lib/server/db.ts`).

## Layout

```
src/app/                 routes; Server Components fetch, client components render
src/app/api/             route handlers
src/components/ui/       hand-rolled primitives (Button, Input, Field, Dialog, Switch, Toast, CopyField, SectionLabel, Shell)
src/components/site/     header, footer, mark
src/components/<feature>/ feature components
src/config/              site.ts (name, copy), csp.ts (CSP allowlist), routes.ts (secret path prefixes)
src/lib/                 pure logic, no JSX; safe on client and server
src/lib/server/          server-only modules (each imports "server-only")
src/proxy.ts             per-request nonce CSP
src/instrumentation-client.ts  PostHog init (off without env vars)
prisma/                  schema, migrations, sql/app-role.sql
scripts/db-check.mjs     build-time schema drift check
```

## Security (non-negotiable)

- **No secrets on the client.** Never prefix a secret with `NEXT_PUBLIC_`. Every
  module that touches the database or a secret lives in `src/lib/server/` and
  imports `server-only`, so importing it from a client component fails the build.
- **Secret links are credentials.** Generate them with `newToken()` (128-bit,
  base62). Never use `cuid()`/`uuid()` for anything that grants access.
  Format-check with `isWellFormedToken()` before querying.
- **Every mutating route starts with `rejectCrossSite(req)`** (CSRF: Sec-Fetch-Site,
  Origin, JSON content type), then `checkRateLimit()` if the route costs anything
  (writes, AI calls, uploads), then `parseJsonBody(req, schema)`. Start new routes by copying an existing
  mutating route (in the template: `src/app/api/spaces/route.ts`).
- **Zod object schemas strip unknown keys**; that is what blocks mass assignment.
  Never use `.passthrough()` / `.loose()`.
- **Return 404, not 403**, for a resource that doesn't exist or isn't the caller's,
  so ids and tokens can't be probed.
- **Select only the fields a view needs** and pass only those across the
  server/client boundary. Never hand a whole row to a client component.
- **Secret-link pages**: add the prefix to `privateHeaders` in `next.config.ts`
  (`no-store`, `noindex`) and to `secretPathPrefixes` in `src/config/routes.ts`
  (log redaction). Page titles never include user content.
- **CSP** is built per request in `src/proxy.ts` with a nonce and must stay the only
  CSP header. Add third-party origins in `src/config/csp.ts`, one comment per entry.
  Violations are logged by `/api/csp-report` (filter Vercel logs on `[csp]`).
- **No inline `style` attributes.** Production CSP is nonce-only for styles.
- **Analytics never carries a secret or a person.** Send events only through
  `track()` (`src/lib/track.ts`) with flat counts, modes and outcomes: no names,
  free text, tokens or per-person amounts. URLs are redacted by `redactEvent`
  (`src/lib/analytics.ts`) from `secretPathPrefixes`; session replay stays off
  unless a tool turns it on with full text masking. See
  `docs/modules/analytics-posthog.md`.

## Database

- The app connects as a **least-privilege role** (`prisma/sql/app-role.sql`):
  row access on app tables only, no DDL.
- **Migrations are applied by the Neon owner role**, not the app role. After a
  migration adds a table, extend the app role's grants.
- `npm run build` runs `scripts/db-check.mjs`, which fails the build if the live
  database doesn't match `schema.prisma` (required on Vercel, skipped locally
  without `DIRECT_URL`).
- A migration folder's name is its sort order. Generate new ones with
  `npx prisma migrate dev --name <name>` or, by hand,
  `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script`
  into a folder timestamped **after** the latest one.
- Concurrency: when two writers can race (two phones tapping at once), lock the
  parent row (`SELECT ... FOR UPDATE` in a transaction) or lean on a unique index.

## Code rules

- Server Components by default. `"use client"` only for state, handlers or browser APIs.
  Initial data is fetched on the server and passed down, never fetched client-side on load.
- **No default exports** except files Next or a tool requires (`page`, `layout`,
  `not-found`, `manifest`, `route` handlers are named exports, configs).
- **One component per file.** Early returns over nesting. **No `any`.**
- Client calls to our own API go through `api()` in `src/lib/api-client.ts`.
- Pure logic belongs in `src/lib/*.ts` with a `*.test.ts` next to it.
- `next/link` for internal links; plain `<a>` only for links that leave the app.
- Colors come from tokens (`ink`, `paper`, `mute`, `faint`, `wash`, and `rule` for the header hairline). Dark mode follows the device
  (`prefers-color-scheme`) by redefining those tokens in `globals.css`; never
  hard-code a color or add `dark:` variants, and check both modes before shipping. Type is
  `display` (Space Grotesk) or mono; small caps text uses the `label` utility.
  Sections are numbered with `SectionLabel`.
- Inputs use 16px text on mobile so iOS doesn't zoom.

## Validating changes

A green `build`, `typecheck` and `lint` are not validation. When you add a
conditional, fallback, retry or anything that depends on external state:

1. Find every consumer with `grep`, not memory.
2. Exercise every branch at runtime (a `curl` sequence against `npm run dev`, or
   a script against a real database).
3. Check the blast radius: which other surfaces could this break?
4. Say what you couldn't exercise.

## Commands

```bash
npm run dev         # dev server
npm run build       # prisma generate + drift check + next build
npm run typecheck   # next typegen + tsc
npm run lint
npm test            # vitest
npx prisma studio
```

## This tool

**Potluck** (working title): one party, one page. When, where, what's needed,
who brings what. Milestones M1 to M4 (see README).

### Access model (enforced server-side, `src/lib/server/parties.ts`)

- **Guest**: knows `/p/<slug>` + the guest password. `POST /api/parties/[slug]/unlock`
  checks the scrypt hash and sets an httpOnly cookie `pg_<partyId>` = `party.guestKey`.
  Rate limited per IP per party (20 / 10 min), no lockout.
- **Host**: holds `/h/<hostToken>`. That route sets `ph_<partyId>` = the token
  and redirects to the clean `/p/<slug>/host`, so the token doesn't sit in the
  address bar. A host is also a guest.
- Anyone else gets the gate (guest page) or the standard 404 (host page, API).
- Guest-facing selects never include `hostToken`, `guestKey` or `guestPasswordHash`.

### Domain rules

- Guest passwords are normalized (trim, collapse spaces, lowercase) before
  hashing and comparing: they are said out loud.
- Slugs are readable (`slugify(title)`), collisions get `-2`, `-3`. They are
  identifiers, not credentials. `/p/` is still in `secretPathPrefixes` so party
  names stay out of logs and analytics.
- Times are stored as an instant plus the host's IANA `timeZone`, and always
  shown in that zone.
- Claims never over-claim: `claimNeed` locks the Need row
  (`SELECT ... FOR UPDATE`) in a transaction, re-sums claims, then inserts.
  Tested with 10 concurrent claims for the last items.
- "Mine" is a per-device httpOnly cookie `pdev` (`src/lib/server/device.ts`),
  set on first claim. It lets a phone remove its own claims; it is not access
  control and never leaves the server (`listNeeds` turns it into `mine`).
- Progress counts items, not quantities: an item is covered when claims reach
  `quantityNeeded`. Max 100 needs per party.
- The guest view looks the same for everyone, host included; host-only actions
  (add/delete items, remove anyone's claim) live on `/p/[slug]/host`.
- RSVPs are one per device per party (unique index), so answering again
  updates. An RSVP sent from a host device is saved with `isHost` and status
  forced to COMING (decided by the host cookie, never the body); hosts RSVP
  from "You're hosting" on the host page and show in their own "Hosting"
  group. Headcount = sum of `partySize` for COMING, hosts included ("including
  N hosting"); MAYBE is summed separately; CANT counts people. Party size shows
  as a "Party of N" tag, never "+N" after the name. The attendee list matches claims to RSVPs by
  device, and lists claimers without an RSVP separately.
- Host edits read the wall-clock time in the party's stored `timeZone`
  (`fromZonedInput`), not the editing device's. The slug never changes on
  edit, so shared links keep working.
- Changing the guest password also replaces `guestKey`, signing every guest
  out. The host cookie is separate and stays valid.
- `.ics` text follows RFC 5545 (`src/lib/ics.ts`): TEXT escaping, CRLF, lines
  folded at 75 UTF-8 bytes without splitting characters. Parties have no end
  time, so DTEND is start + 3 hours.
- The "Nudge the group" share text (`src/lib/share-text.ts`, host page) lists
  only open items, in category order, with what's left. It never includes the
  password (we only store its hash); the host shares that separately.
- The address gets both Apple Maps and Google Maps links (`mapLinks`).
- Cost splitting is a link to TabMath (`site.tabMath` in `src/config/site.ts`,
  with utm params). Potluck never handles money.

### Themes (documented exception to "never hard-code a color")

- All theme data lives in `src/lib/themes.ts`, one object per theme
  (Thanksgiving, Holiday Classic, Winter Wonderland, New Year's Eve, Cozy
  Cabin, Plain), in the order the picker shows them. Holiday Classic stays the
  default for new parties. Adding a
  theme = adding an object (+ an art component in `HeaderArt` if it has new art).
- A theme sets `--theme-accent`, `--theme-on-accent`, `--theme-tint` and
  `--theme-art` per color scheme. Components use `bg-(--theme-tint)` etc.
  The shared tokens in `globals.css` are untouched; Plain maps to the base tokens.
- `scheme: "dark"` (New Year's Eve) re-points the base tokens to their dark
  values inside that theme's scope only, so the page is dark in light mode too.
  A test keeps that copy in sync with `globals.css`.
- All theme CSS is served as one same-origin stylesheet, `/themes.css`
  (`src/app/themes.css/route.ts`, static, content-hashed URL from the root
  layout). **Don't render theme CSS in a `<style>` tag**: a client-side
  navigation carries a new request nonce the page's CSP doesn't know, so the
  style gets blocked and the theme disappears.
- Theme colors must pass `isSafeColor` (hex or `var(--color-*)`), enforced by test.

### Routes

- `/` create a party, `/p/[slug]` gate or party page, `/p/[slug]/host` host view,
  `/p/[slug]/host/edit` edit details, theme and guest password,
  `/h/[token]` host link (sets cookie, redirects), `/themes.css` theme sheet
- API: `POST /api/parties`, `GET /api/parties/[slug]` (guest-scoped),
  `POST /api/parties/[slug]/unlock`
- Needs (host only): `POST /api/parties/[slug]/needs`,
  `DELETE /api/parties/[slug]/needs/[needId]` (cascades its claims)
- Claims (guest or host): `POST /api/parties/[slug]/claims` (409 with
  `remaining` when someone got there first), `DELETE /api/parties/[slug]/claims/[claimId]`
  (own device, or any claim for the host)
- RSVPs (guest or host): `POST /api/parties/[slug]/rsvps` (upsert per device),
  `DELETE /api/parties/[slug]/rsvps/[rsvpId]` (own device, or any for the host)
- Host: `PATCH /api/parties/[slug]/host` (details + theme),
  `POST /api/parties/[slug]/host/password` (new password, signs guests out)
- Calendar (guest or host): `GET /api/parties/[slug]/calendar.ics`, one
  VEVENT in UTC, 3-hour default length, generic `party.ics` file name

### Analytics events

`party_created { theme, has_address, has_notes }`, `party_unlocked { outcome }`,
`need_added { category, quantity, has_unit, has_note }`, `need_deleted { had_claims }`,
`item_claimed { outcome, quantity?, filled? }`, `claim_removed { by }`,
`rsvp_sent { status, party_size, changed, host }`, `rsvp_removed { by }`,
`party_edited { theme_changed, time_changed, theme }`, `password_changed`,
`calendar_downloaded`, `share_text_used { method, items_left }`, `tabmath_clicked { from }`.
