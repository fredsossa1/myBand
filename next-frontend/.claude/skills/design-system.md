# Band Availability — Design System

You are working on the **Band Availability** app. Whenever writing UI code or making design decisions, follow this system exactly. Do NOT use Tailwind gradient backgrounds, glass morphism, or shadcn Card components unless modifying legacy code.

---

## Color Palette

All colors are available as CSS custom properties (set in `app/globals.css`):

| Token | Value | Use |
|---|---|---|
| `--app-bg` | `#0d1117` | Page background |
| `--app-surface` | `#161b22` | Card / panel background |
| `--app-surface-hover` | `#1c2128` | Hover state on surface |
| `--app-border` | `#30363d` | All borders |
| `--app-text` | `#e6edf3` | Primary text |
| `--app-text-muted` | `#8b949e` | Secondary / label text |
| `--app-accent` | `#2dd4bf` | Teal — primary action, active nav, CTAs |
| `--app-accent-dim` | `rgba(45,212,191,0.1)` | Accent background tint |

### Semantic colors (inline style values, not tokens):
- **Success / Available**: `#3fb950` bg: `rgba(63,185,80,0.1)`
- **Danger / Unavailable**: `#f85149` bg: `rgba(248,81,73,0.1)`
- **Warning / Uncertain / At-risk**: `#d29922` bg: `rgba(210,153,34,0.1)`
- **Info**: `#58a6ff` bg: `rgba(88,166,255,0.1)`

---

## Typography

- **Page title**: `text-xl font-semibold` — `var(--app-text)`
- **Section header**: `text-xs font-medium uppercase tracking-wider` — `var(--app-text-muted)` at 60% opacity
- **Body text**: `text-sm` — `var(--app-text)`
- **Label / secondary**: `text-xs` — `var(--app-text-muted)`
- **Large stat number**: `text-3xl font-bold tracking-tight` — `var(--app-text)`

---

## Spacing & Layout

- **Page padding**: `p-6 lg:p-8`
- **Section gap**: `space-y-6` or `gap-6`
- **Card inner padding**: `p-4` or `p-5`
- **Item row padding**: `px-4 py-3` (list rows), `px-5 py-3` (content rows)

### App Shell (set in `components/app-shell.tsx`):
```
min-h-screen flex                         ← root
  ├── w-60 border-r sidebar              ← desktop only, hidden on mobile
  └── flex-1 flex flex-col main
        └── p-6 lg:p-8 page content
```

### Split-panel layout (Schedule page):
```
grid grid-cols-[minmax(280px,2fr)_minmax(0,3fr)] gap-0 h-[calc(100vh-4rem)]
  ├── left: scrollable event list, border-r
  └── right: sticky event detail panel
```

---

## Component Patterns

### Surface card
```tsx
<div className="rounded-xl border" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
```

### Section header
```tsx
<p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
  SECTION LABEL
</p>
```

### Primary CTA button (teal)
```tsx
<button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
  style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}>
```

### Ghost button (bordered)
```tsx
<button className="px-3 py-1.5 rounded-lg border text-sm transition-colors hover:bg-white/5"
  style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
```

### Status pill — availability
```tsx
// Available
<span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
  style={{ color: "#3fb950", backgroundColor: "rgba(63,185,80,0.1)" }}>Available</span>

// Unavailable
<span ... style={{ color: "#f85149", backgroundColor: "rgba(248,81,73,0.1)" }}>Unavailable</span>

// Uncertain
<span ... style={{ color: "#d29922", backgroundColor: "rgba(210,153,34,0.1)" }}>Uncertain</span>

// Not set
<span ... style={{ color: "var(--app-text-muted)", backgroundColor: "var(--app-border)" }}>—</span>
```

### Coverage bar
```tsx
// Bar track
<div className="w-full rounded-full h-1.5" style={{ backgroundColor: "var(--app-border)" }}>
  // Bar fill — color by score
  <div className="h-1.5 rounded-full transition-all duration-500"
    style={{ width: `${score}%`, backgroundColor: score >= 100 ? "#3fb950" : score >= 50 ? "#d29922" : "#f85149" }} />
</div>
```

### Active nav item (sidebar)
```tsx
style={{ backgroundColor: "var(--app-accent-dim)", color: "var(--app-accent)" }}
```

### Divider
```tsx
<div className="h-px" style={{ backgroundColor: "var(--app-border)" }} />
```

### List row (hoverable)
```tsx
<div className="px-4 py-3 flex items-center gap-3 hover:bg-white/3 transition-colors cursor-pointer border-b"
  style={{ borderColor: "var(--app-border)" }}>
```

### Active list row (selected event)
```tsx
style={{ backgroundColor: "var(--app-accent-dim)", borderLeft: "2px solid var(--app-accent)" }}
```

---

## Navigation Structure

```
Sidebar (components/sidebar.tsx):
  ♪ Band                          ← brand icon (teal square)

  Schedule    /                   ← always visible
  Analytics   /stats              ← admin only, locked icon if no access

  ─────
  [user name + role]
  [admin badge if admin]
  → Sign out
  ─────
  Language toggle
```

---

## Page Structure

### `/` — Schedule
Split-panel. Left: compact event list grouped TODAY / UPCOMING / PAST. Right: event detail with 3-button availability selector + coverage grid (admin) + response list (admin).

### `/stats` — Analytics (admin only)

Summary row → Coverage by role (horizontal bars) → Events at risk (< 70%) → Member response rates (sorted asc).

---

## UX Principles

1. **Primary action first** — The member's job is to mark availability. Status buttons should be the first thing visible in the event detail, above all other info.
2. **Progressive disclosure** — Members see their own status + coverage score. Admins see full response tables. Never show admin data to regular users.
3. **No page reloads for status changes** — Use `setAvailabilityRemote` (saves immediately on click). No pending/submit flow needed for single-event availability.
4. **Compact list, rich detail** — Event list rows are minimal (title, date, your status). Detail panel is where context lives.
5. **Surface problems** — "At risk" events (< 70% coverage) should be visually prominent in both the list and the analytics page.

---

## File Reference

| Concern | File |
|---|---|
| Color tokens | `app/globals.css` |
| Layout shell | `components/app-shell.tsx` |
| Sidebar | `components/sidebar.tsx` |
| Schedule page | `components/schedule-page.tsx` |
| Event list panel | `components/schedule/event-list.tsx` |
| Event detail panel | `components/schedule/event-detail.tsx` |
| Analytics page | `app/stats/page.tsx` |
| Availability hook | `hooks/use-availability.ts` |
| Coverage utils | `lib/utils.ts` → `calculateEventCoverage` |
| Types | `lib/types.ts` |
| Constants + icons | `lib/constants.ts` |
