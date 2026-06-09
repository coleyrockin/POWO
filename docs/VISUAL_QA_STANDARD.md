# Visual QA and README Screenshot Standard

This is the default presentation gate for POWO and the baseline to reuse on future visual projects.

## Required viewports

| Surface | Viewport |
|---|---:|
| Desktop dashboard | 1440 x 1000 |
| iPad portrait | 820 x 1180 |
| iPhone | 390 x 844 |

## Release gate

1. Build and inspect the production app, not a stale development tab.
2. Test dark and light themes.
3. Test reduced-motion mode.
4. Confirm there are no console errors, framework overlays, blank reveal states, or missing assets.
5. Confirm the page has no horizontal overflow.
6. Confirm section titles are fully visible; secondary metadata may truncate first.
7. Exercise section navigation, the dashboard window selector, period comparison, and the theme toggle.
8. Run `npm run test:visual:update`, then `npm run test:visual`.
9. Run `npm run screenshots:readme` after the final production build.
10. Review all three generated images before committing them.

## Screenshot contract

- Store the current showcase images in `docs/screenshots/`.
- Keep stable filenames so the README never points at an abandoned dated artifact.
- Capture the first meaningful viewport in dark mode with reduced motion.
- Hide transient utility controls from showcase captures, but test them in the live audit.
- Never reuse screenshots after the data window, hero totals, typography, or responsive layout changes.
- The README must show desktop, iPad, and iPhone together.

## Generated files

```text
docs/screenshots/dashboard-desktop.png
docs/screenshots/dashboard-ipad.png
docs/screenshots/dashboard-iphone.png
```

Regenerate them with:

```bash
npm run screenshots:readme
```
