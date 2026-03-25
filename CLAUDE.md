# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Band Availability System — a Next.js 14 full-stack app for managing worship team scheduling. Members submit availability for events; admins manage events and view coverage analytics.

## Commands

All commands should be run from the repo root unless noted.

```bash
# Development
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm start            # Run production server

# Linting
cd next-frontend && npm run lint

# Legacy Express server (maintenance mode only)
npm run legacy:start
```

There is no test runner currently configured beyond `node test/run-tests.js`.

### Environment Setup

Copy `.env.example` to `.env` and populate:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — For server-side operations
- `ADMIN_PASSWORD` — Hashed admin password

Run `supabase-setup.sql` against your Supabase project to initialize the schema.

## Architecture

### Stack
- **Framework:** Next.js 14 App Router, React 18, TypeScript (strict)
- **UI:** shadcn/ui (Radix UI + Tailwind CSS)
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Validation:** Zod

### Data Flow

```
React Component
  → Custom Hook (next-frontend/hooks/)
    → BandApi class (next-frontend/lib/api.ts)
      → Next.js API Route (next-frontend/app/api/)
        → Database layer (next-frontend/lib/db.ts)
          → Supabase
```

- **`lib/api.ts`** — `BandApi` static class; all frontend-to-backend HTTP calls go through here
- **`lib/api-hooks.ts`** — Generic `useApiCall<T>` hook factory; all data-fetching hooks are built on this
- **`lib/db.ts`** — All Supabase queries; this is the only file that touches the database
- **`lib/types.ts`** — Shared TypeScript interfaces (`Member`, `Event`, `Availability`, etc.)
- **`lib/constants.ts`** — Role definitions, availability states, service type requirements
- **`lib/i18n.ts`** — Full translation strings (large file, ~23K lines)

### State Management
- **`AdminProvider`** and **`LanguageProvider`** wrap the root layout and provide context globally
- No Redux/Zustand — local state via React hooks and custom hooks

### Database Schema
- `members` — id, name, role
- `events` — id, date, title, description, type
- `availability` — (event_id, person_id) composite key, state (`A`/`U`/`?`)
- `settings` — key-value store for admin config
- `availability_by_date` — backward-compatibility view

### Service Type Coverage Requirements
Each service type has minimum role requirements enforced in `lib/constants.ts`:
| Type | Bass | Keys | Drums | Lead | BV |
|------|------|------|-------|------|----|
| Service | 1 | 1 | 1 | 1 | 2+ |
| Band Only | 1 | 1 | 1 | — | — |
| Jam Session | 1 | 1 | 1 | 1 | 1 |
| Special Event | 1 | 1 | 1 | 1 | 2+ |

### Legacy Server
`server/` contains an Express.js API that predates the Next.js migration. It is in maintenance mode — do not add features there. Prefer Next.js API routes in `next-frontend/app/api/`.

## Key Conventions

- API routes follow REST conventions; protected admin routes verify `ADMIN_PASSWORD` server-side
- Member data sourced from `data/members.json` (27 members, 6 roles)
- Keyboard shortcuts: `A` = availability, `U` = unavailable, `?` = unsure, `Shift+A` = bulk
- Deployment target is Railway; config in `railway.json` and `nixpacks.toml`
