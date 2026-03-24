

## Plan: Wire All Landing Page Buttons & Add Navigation

### Summary
Wire every button/link on the landing page to functional routes, add Login/Register buttons to the nav, make the Echo logo a home link, replace the "About"/"Safety" links with a working About page and a 3-dot menu for disclaimers/legal info.

### Changes

#### 1. New page: `/about` (`src/pages/About.tsx`)
- Stub page using the existing `PageShell` layout
- Cormorant heading "About Echo." with placeholder body text sections (What is Echo, Our Mission, The Formation, Contact)
- Empty content the user can fill later

#### 2. Update `src/App.tsx`
- Add route: `/about` → `<About />`

#### 3. Rewrite `src/pages/Index.tsx` nav header
- **Echo logo** (`● Echo`): wrap in `<Link to="/">` so it acts as a home button
- **Right side nav**: remove "About" and "Safety" text links, replace with:
  - `<Link to="/about">About</Link>` (working link)
  - `<Link to="/login">Log In</Link>` (DM Mono, uppercase, same style)
  - A 3-dot menu button (`MoreVertical` from Lucide) that opens a dropdown (using the existing shadcn `DropdownMenu`) containing:
    - "Safety & Disclaimers" (scrolls to or shows the Trust section content)
    - "Privacy" (placeholder)
    - "Terms" (placeholder)
    - "Contact" (placeholder)

#### 4. Wire all CTA buttons in `Index.tsx`
- **"Find a Listener"** → already wired to `/chat/new` ✓
- **"Become a Listener"** → already wired to `/formation` ✓
- **"Begin Formation"** button in FormationSection → add `onClick={() => navigate("/formation")}`

#### 5. Update footer links
- "About" → `<Link to="/about">`
- "Safety" → `<Link to="/about">` (or anchor, since About page will have safety info)
- "Become a Listener" → `<Link to="/formation">`

### Technical Details
- Uses existing `DropdownMenu` from shadcn (`src/components/ui/dropdown-menu.tsx`)
- Uses `MoreVertical` icon from `lucide-react`
- All links use `react-router-dom` `Link` / `useNavigate`
- About page uses existing `PageShell` component for consistent layout
- Design system maintained: DM Mono nav text, 1px borders, no border-radius, B&W

