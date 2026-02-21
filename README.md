# 🎵 Band Availability System

A modern web application for managing worship team availability. Built with Next.js 14, TypeScript, and Supabase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20%2B-green.svg)

## Features

- **Smart Coverage Analysis** — Real-time validation of band requirements per service type
- **Modern UI** — Glass morphism design with shadcn/ui components
- **PWA Support** — Install as mobile/desktop app with offline capabilities
- **Keyboard Shortcuts** — `A`/`U`/`?` for quick availability, `Shift+A` for bulk operations
- **Admin Panel** — Event management, CSV export, coverage statistics
- **Role-based Organization** — Bassist, Pianist, Drummer, Lead, Background Vocals

## Service Type Requirements

| Type | Bass | Keys | Drums | Lead | BV |
|------|------|------|-------|------|-----|
| Service | 1 | 1 | 1 | 1 | 2+ |
| Band Only | 1 | 1 | 1 | - | - |
| Jam Session | 1 | 1 | 1 | 1 | 1 |
| Special Event | 1 | 1 | 1 | 1 | 2+ |

## Quick Start

### Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/fredsossa1/myBand.git
cd myBand/next-frontend
npm install
```

### 2. Database Setup

1. Create a new Supabase project
2. Go to **SQL Editor** in your dashboard
3. Run the contents of `supabase-setup.sql`
4. Copy your **Project URL** and **anon key** from Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Connect repo at [railway.app](https://railway.app)
3. Set environment variables in dashboard
4. Deploy automatically

### Vercel

```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Render

1. Connect repo at [render.com](https://render.com)
2. Build: `npm install`
3. Start: `npm start`
4. Add environment variables

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Components | shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Hosting | Railway / Vercel / Render |

## Project Structure

```
myBand/
├── next-frontend/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── availability/ # Main availability page
│   │   └── stats/        # Statistics dashboard
│   ├── components/       # UI components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities, types, db
├── server/               # Legacy Express server
├── data/                 # Sample data
└── supabase-setup.sql    # Database schema
```

## Usage

### For Band Members

1. Select your name from dropdown
2. View events with coverage indicators
3. Click to cycle: Not Responded → Available → Unavailable → Uncertain
4. Submit when ready

### For Admins

1. Click **Admin Login**
2. Create events with appropriate service type
3. Export availability to CSV for Planning Center

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

## License

[MIT](LICENSE)

---

Built with ❤️ for worship teams
