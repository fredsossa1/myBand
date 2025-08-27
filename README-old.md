# 🎵 Band Availability System

A modern, production-ready web application for managing worship team availability. Features keyboard shortcuts, bulk operations, PWA capabilities, and seamless Planning Center integration.

## ✨ Key Features

### 🚀 **Phase 1 UX Enhancements**

- **⌨️ Keyboard Shortcuts**: Press `A`, `U`, `?` for quick responses
- **📦 Bulk Operations**: `Shift + A` to set multiple events at once  
- **↩️ Undo Functionality**: `Ctrl/Cmd + Z` to undo mistakes
- **📱 Progressive Web App**: Install as mobile/desktop app
- **🎨 Modern UI**: Professional animations and responsive design

### 👥 **Team Management**

- **18 Team Members** across 5 roles (Pianists, Lead Singers, Background Vocals, Bassists, Drummers)
- **One-click availability** setting with visual feedback
- **Real-time updates** when multiple users edit simultaneously
- **Mobile-optimized** interface for on-the-go responses

### 🔐 **Admin Features**

- **Secure admin access** (password: `band2025`)
- **Event management** with titles and descriptions
- **CSV export** for Planning Center scheduling
- **Text export** for quick copy/paste summaries
- **Bulk event creation** for recurring services

### 📊 **Data & Export**

- **Supabase database** backend for reliability
- **Planning Center CSV** format: date, bassist, drummer, pianist, lead, bv1, bv2
- **Response tracking** with progress indicators
- **Data persistence** across server restarts

## 🏗️ Architecture

- **Backend**: Node.js + Express with Supabase PostgreSQL database
- **Frontend**: Vanilla JavaScript with PWA capabilities
- **Database**: Supabase (cloud-hosted, production-ready)
- **Hosting**: Ready for Railway, Render, or Vercel deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Supabase account (free tier available)

### Installation

```bash
# Clone and install dependencies
npm install

# Set up database (see DEPLOY.md for Supabase setup)
# Copy contents of supabase-setup.sql to your Supabase SQL editor

# Configure environment
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-key"

# Start the server
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### First Use

1. **Admin Setup**: Click "🔐 Admin" and use password `band2025`
2. **Add Events**: Create events with dates and descriptions
3. **Share URL**: Send the localhost URL to team members
4. **Team Response**: Members select their name and set availability
5. **Export**: Use CSV export for Planning Center integration

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A` | Set Available |
| `U` | Set Unavailable |
| `?` | Set Uncertain |
| `Shift + A` | Bulk set Available |
| `Shift + U` | Bulk set Unavailable |
| `Ctrl/Cmd + Z` | Undo last action |

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in Safari/Chrome
2. Tap "Add to Home Screen" when prompted
3. App appears as native app icon

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click to install as desktop app
3. App opens in dedicated window

## 📊 Planning Center Integration

1. Click "Export CSV" in admin panel
2. Copy the generated CSV data
3. Import into Planning Center scheduling
4. Columns map to: date, bassist, drummer, pianist, lead, bv1, bv2
5. Values: `A` (Available), `U` (Unavailable), blank (Unknown)

## 🗂️ Project Structure

```text
myBand/
├── server/
│   ├── server.js          # Express server
│   └── db.js              # Supabase database layer
├── src/
│   ├── app.js             # Main application logic
│   └── dom.js             # DOM utilities
├── data/
│   └── members.json       # Team member configuration
├── index.html             # Main interface
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── package.json           # Dependencies
└── supabase-setup.sql     # Database setup script
```

## 🎯 Current Team Configuration

**18 Members across 5 roles:**
- **Pianists** (3): Sarah Johnson, Michael Chen, Emma Davis
- **Lead Singers** (4): David Thompson, Rachel Miller, Alex Rodriguez, Lisa Wang
- **Background Vocals** (6): Jessica Brown, Tyler Johnson, Samantha Lee, Jordan Smith, Ashley Garcia, Ryan Martinez
- **Bassists** (3): Chris Anderson, Maya Patel, Jake Wilson
- **Drummers** (2): Marcus Taylor, Zoe Clark

*Edit `data/members.json` to modify team configuration*

## 🔧 Configuration

### Admin Password
Default: `band2025`
- Change in `server/db.js`: `adminPassword: 'your-new-password'`
- Or update in Supabase settings table

### Team Members
Edit `data/members.json` to modify:
- Member names
- Role assignments
- Add/remove positions

## 📋 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/members` | GET | Get all team members |
| `/api/events` | GET | Get all events |
| `/api/availability` | GET/POST | Get/set availability |
| `/api/admin/events` | POST | Add event (admin) |
| `/api/export/csv` | GET | Export CSV data |
| `/api/export/summary` | GET | Export text summary |
| `/api/reset` | POST | Reset data (admin) |

## 🚀 Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions including:
- Railway + Supabase setup
- Environment configuration
- Production considerations
- Troubleshooting

## 🧪 Testing

```bash
npm test
```

Runs basic logic tests for core functionality.

## 📈 Future Enhancements

- **Authentication**: Individual user accounts
- **Notifications**: Email alerts for new events
- **Calendar Integration**: Google Calendar sync
- **Advanced Analytics**: Response pattern analysis
- **Theme Customization**: Multiple UI themes
- **Multi-language Support**: Localization

## 📄 License

MIT License - See LICENSE file for details

## 🎵 Ready for Your Worship Team!

Your Band Availability System is production-ready with modern features, reliable data storage, and a professional user experience. Start coordinating your worship team more effectively today!

---

*Built with ❤️ for worship teams everywhere*

## 🚀 Ready to Deploy

See `DEPLOY.md` for step-by-step deployment instructions to Railway, Render, or Vercel.

**Default admin password:** `band2025`

## Running

Install dependencies and start the multi-user server:

```bash
npm install
npm start
```

Open <http://localhost:5173> in a browser. Share this URL with band members.

## Exporting CSV

Use the Export section at the bottom. CSV columns: `date,bassist,drummer,pianist,lead,bv1,bv2`. Values: `A` (available), `U` (unavailable), blank for unknown.

## Planning Center Workflow

1. Open tool, set upcoming service dates.
2. Share JSON snapshot with members (or host somewhere) for them to update (future multi-user option).
3. Filter for dates where all critical roles are `A`.
4. Export CSV, copy into Planning Center or manually create the plans referencing the summary.

## Configuration

Edit `data/members.json` to change the member assigned to each role. Reload page—existing availability will be remapped (old member keys retained until cleared). Use the Reset Data button if you want a clean slate.

## Tests

Run logic tests:

```bash
npm test
```

## Data Model

```jsonc
// availability record shape (stored inside localStorage key "availabilityData")
{
  "dates": ["2025-09-07", "2025-09-14"],
  "members": {"bassist":"Alice", "drummer":"Bob", ...},
  "availability": {
    "2025-09-07": { "bassist":"A", "drummer":"U", "pianist":"?", "lead":"A", "bv1":"A", "bv2":"?" }
  }
}
```

States: `A` (Available), `U` (Unavailable), `?` (Unknown / not answered yet).

## Suggested Alternate Approaches

If needs grow:

- Form-based collection: Send a weekly link (Google Form) per date and aggregate responses offline.
- Shared spreadsheet with data validation per role per date (fast to prototype).
- Lightweight backend (SQLite + REST) enabling members to log in and update their own status; add audit trail.
- Use Planning Center's block-out dates API (if accessible) to import unavailability automatically.

## License

Private/internal use.
