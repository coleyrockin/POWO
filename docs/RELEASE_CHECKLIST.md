# POWO Release Checklist

Use this before pushing changes that affect public presentation, data, metadata, dependencies, or deployment.

## Local Verification

1. Confirm the worktree is on the intended branch and clean except for planned changes.
2. Install with `npm ci` when validating a fresh checkout.
3. Run `npm run verify`.
4. Run `npm run audit:prod`.
5. Run `npm run smoke` against the existing `.next` build.
6. For the full local release gate, run `npm run qa`.
7. Run a production preview with `npm run build && npm run start` for manual inspection.

`next/font/google` fetches Google font files at build time when the cache is empty, so production builds need outbound network access.

The smoke gate defaults to port `3010`. Use `POWO_SMOKE_PORT=4010 npm run smoke` if another local service is already using that port. It verifies the homepage, manifest, robots, sitemap, OG/Twitter image routes, security headers, and branded 404 behavior.

## Visual QA

- Check the home page at `375px`, `390px`, `430px`, and desktop width.
- Verify no horizontal overflow, clipped text, broken chart labels, or blank Framer Motion reveal states.
- Confirm `docs/screenshot.jpg` and the public screenshots still match the current data window and hero totals.
- Check reduced-motion mode for readable non-jarring states.

## Public Repo Review

- README live link, screenshot, setup commands, script table, and deployment notes are current.
- `SECURITY.md` is present and private health export folders remain ignored.
- No raw Apple Health exports, `.env` files, or generated preview artifacts are staged.
- `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`, OG image, Twitter image, custom 404, and error boundary still build.
- `npm run smoke` passes after `npm run build`, proving the production server can serve the core public routes and metadata responses.

## Deployment

- Main branch deploys to Vercel at `https://proof-of-workout-next.vercel.app`.
- Production CSP must allow Vercel Analytics and Speed Insights script/ingest hosts when telemetry dependencies are present.
- After deploy, spot-check the live URL, metadata/social preview routes, and Vercel analytics ingestion.
