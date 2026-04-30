
# Plan: Fix font inconsistency in Dashboard / Room

## What's wrong

The landing page renders cleanly in **DM Mono** (loaded via `@import` in `src/index.css`). The Dashboard and Room *also* use the right Tailwind classes (`font-body`, `font-display`), so on paper they should match — but in practice they look different. After auditing, there are three real causes:

1. **DM Mono is loaded only via CSS `@import`** in `src/index.css`. CSS `@import` is render-blocking and parsed *after* the stylesheet itself loads, so on heavier authenticated pages (Dashboard, Room with `react-grid-layout`, Aura, etc.) the browser flashes/falls back to the system serif/sans before swapping in DM Mono. The landing page is light enough that you don't notice; the Room is not.
2. **`react-grid-layout/css/styles.css`** (imported in `DashboardRoom.tsx`) ships its own `font-family` reset on `.react-grid-item` children, which can override our `body` font on widgets.
3. The Tailwind config only registers `font-display` and `font-body` (both DM Mono) — there's **no `font-sans` / `font-mono` / `font-serif`** mapped to DM Mono. Any third-party component (shadcn dialogs, sheets, react-grid-layout content, etc.) that uses Tailwind's default `font-sans` ends up rendering in the browser default sans-serif. This is the main visible inconsistency inside the Room.

The memory note mentioning "Cormorant Garamond" is stale — the codebase only ships DM Mono. The plan keeps DM Mono as the single typeface, matching the landing page exactly.

## Fix (minimal, no redesign)

### 1. Load DM Mono properly in `index.html`
Add real `<link rel="preconnect">` + `<link rel="stylesheet">` tags for DM Mono in `<head>` so the font is fetched before React mounts. This eliminates the FOUT on Dashboard/Room.

### 2. Remove the duplicate `@import` from `src/index.css`
Once `index.html` loads the font, remove the top `@import url(...DM+Mono...)` line so the font isn't requested twice and isn't render-blocking inside the CSS bundle.

### 3. Make `font-sans`, `font-mono`, `font-serif` all map to DM Mono in `tailwind.config.ts`
```ts
fontFamily: {
  display: ["DM Mono", "monospace"],
  body:    ["DM Mono", "monospace"],
  sans:    ["DM Mono", "monospace"],
  mono:    ["DM Mono", "monospace"],
  serif:   ["DM Mono", "monospace"],
}
```
This guarantees that any shadcn/Radix/react-grid-layout subtree that doesn't explicitly use `font-body` still renders in DM Mono.

### 4. Force DM Mono on the Room grid in `src/index.css`
Add a single targeted rule so `react-grid-layout`'s injected styles don't win:
```css
.react-grid-item, .react-grid-item * {
  font-family: var(--font-body);
}
```

### 5. Sanity sweep (read-only verification, no edits unless needed)
- Confirm `Dashboard.tsx`, `SeekerDashboard.tsx`, `ListenerDashboard.tsx`, `DashboardRoom.tsx`, all `room/widgets/*` already use `font-body`/`font-display` (they do — verified).
- Confirm no page imports a competing Google Font (verified — only DM Mono).

## Out of scope (per your instructions)

- No changes to chat-room routing.
- No redesign of Dashboard or Room layouts.
- No new typefaces (Cormorant Garamond stays unused; landing system is preserved exactly).

## Files touched

- `index.html` — add font preconnect + stylesheet links
- `src/index.css` — remove `@import`, add `.react-grid-item` font rule
- `tailwind.config.ts` — extend `fontFamily` with `sans`/`mono`/`serif` aliases to DM Mono

## Verification after implementation

Open `/dashboard` and `/dashboard/room` in the preview, screenshot, and confirm headings and widget text render in DM Mono identical to the landing hero.
