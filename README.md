# 🎵 Band Availability System

A modern, production-ready web application for managing worship team availability with Next.js 14, TypeScript, smart coverage analysis, and Supabase backend.

## ✨ Key Features

### 🎯 **Smart Coverage Analysis**
- **Service Types**: Service, Band Only, Jam Session, Special Event
- **Coverage Requirements**: Automatic validation of minimum band requirements
- **Visual Indicators**: ✅ Fully covered, ⚠️ Partial coverage, ❌ Not covered
- **Real-time Analysis**: Coverage percentage and role-by-role breakdown

### 🎨 **Modern UI Design**
- **Glass Morphism**: Beautiful modern interface with backdrop blur effects
- **Next.js 14**: Built with App Router and TypeScript for type safety
- **shadcn/ui**: Professional component library with consistent design
- **Responsive**: Optimized for desktop, tablet, and mobile devices

### 🚀 **Advanced Features**
- **Admin Management**: Secure admin login for event creation and management
- **Smart Availability**: Distinguishes between "Not Responded" and "Uncertain"
- **Real-time Updates**: Local state management with server synchronization
- **Keyboard Shortcuts**: Ctrl+R (refresh), Ctrl+Z (undo), Ctrl+S (save)
- **Bulk Operations**: Set availability for multiple events at once

### 👥 **Team Management**
- **Role-based Organization**: Bassist, Pianist, Drummer, Lead, Background Vocals, Admin
- **Visual Feedback**: Color-coded availability states and pending changes
- **Coverage Tracking**: See which services need more musicians

## 🎵 Service Type Requirements

| Service Type | Bassist | Pianist | Drummer | Lead | BV |
|-------------|---------|---------|---------|------|-----|
| **Service** | 1 | 1 | 1 | 1 | 2+ |
| **Band Only** | 1 | 1 | 1 | - | - |
| **Jam Session** | 1 | 1 | 1 | 1 | 1 |
| **Special Event** | 1 | 1 | 1 | 1 | 2+ |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free at [supabase.com](https://supabase.com))

### 1. Database Setup
1. Create a new Supabase project
2. Copy the contents of `supabase-setup.sql`
3. Run the SQL in your Supabase SQL Editor
4. Note your Project URL and anon key from Settings → API

### 2. Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd myBand/next-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Environment Variables
Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=worship2024
```

### 4. Run the Application
```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Visit http://localhost:3000 to see your application!

## 🛠️ Admin Features

### Admin Access
- Login with password: `worship2024` (or your custom password)
- Create and manage events
- View comprehensive coverage statistics
- Export availability data

### Event Management
1. Click "🔓 Admin Login" on any page
2. Enter admin password
3. Use "📅 Add Event" to create new events
4. Select appropriate service type for automatic coverage requirements

## 📱 User Experience

### For Band Members
1. Select your name from the dropdown
2. View upcoming events with coverage status
3. Click availability buttons to cycle through: Not Responded → Available → Unavailable → Uncertain
4. Submit changes when ready (changes are saved locally first)

### Coverage Indicators
- **✅ Green**: Service is fully covered
- **⚠️ Yellow**: Partially covered (some roles missing)
- **❌ Red**: Not covered (critical gaps)

## 🔧 Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with custom glass morphism theme
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Railway, Vercel, or any Node.js hosting

## 🚀 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### Vercel
1. Connect repository to Vercel
2. Set environment variables
3. Deploy with automatic previews

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Architecture

```
next-frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with admin auth
│   ├── availability/      # Availability management
│   ├── stats/            # Statistics dashboard
│   └── api/              # API routes
├── components/           # Reusable UI components
├── lib/                 # Utilities and configuration
│   ├── types.ts         # TypeScript type definitions
│   ├── db.ts           # Database functions
│   ├── utils.ts        # Coverage analysis utilities
│   └── constants.ts    # Application constants
└── hooks/              # Custom React hooks
```

## 🎯 Coverage Analysis System

The application automatically calculates whether each service has adequate coverage based on the service type:

- **Real-time calculations** as availability changes
- **Visual feedback** with percentage and status indicators
- **Role-by-role breakdown** showing available vs required musicians
- **Smart defaults** for different service types

## � Documentation

For detailed guides and reference materials, visit the **[docs folder](docs/)**:

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Deployment Guide](docs/DEPLOY.md)** - Deploy to Railway, Vercel, or other platforms
- **[Changelog](docs/CHANGELOG.md)** - Version history and release notes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for worship teams everywhere** 🙏
- **Progressive Web App** with offline capabilities
- **Glass morphism UI** with backdrop blur effects
- **Keyboard shortcuts** (A/U/? for quick responses)
- **Bulk operations** (Shift+A for multiple events)
- **Mobile-optimized** responsive design

📁 **Location**: Root directory  
🌐 **Server**: `npm start` (http://localhost:5173)

## ✨ Key Features

### 🎨 **Modern UI Design**
- **Glass Morphism**: Beautiful modern interface with backdrop blur and gradient effects
- **Smooth Animations**: Professional slide-in animations and transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Submit Workflow**: Enhanced UX with pending changes and batch submission

### ⌨️ **Enhanced User Experience**
- **Keyboard Shortcuts**: Press `A`, `U`, `?` for quick responses
- **Bulk Operations**: `Shift + A` to set multiple events at once  
- **Submit/Discard**: Local change tracking with batch submission workflow
- **Visual Feedback**: Pending changes highlighted in blue before submission

### 👥 **Team Management**
- **19 Team Members** across 5 roles (Vocals, Guitar, Bass, Drums, Keys)
- **One-click availability** setting with instant visual feedback
- **Real-time updates** through Supabase backend
- **Role-based organization** for easy team coordination

### 🔐 **Admin Features**
- **Event management** with dates and descriptions
- **CSV export** for Planning Center scheduling
- **Data administration** and bulk operations
- **Secure backend** with Supabase authentication

### 📱 **Progressive Web App**
- **Install as native app** on mobile and desktop
- **Offline capability** with service worker caching
- **App-like experience** with dedicated window

## 🚀 Quick Setup

### Prerequisites
- Node.js 20+ installed (required for Supabase compatibility)
- Supabase account (free tier available)

> **⚠️ Node.js Version:** This project requires Node.js 20 or later due to Supabase dependencies. If you're using an older version, please upgrade to avoid deprecation warnings.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd myBand
npm install
```

### 2. Set Up Supabase Database
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and run the contents of `supabase-setup.sql`
4. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Supabase credentials
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Choose Your Frontend

#### **Option A: Next.js 14 Frontend (Recommended)**
```bash
cd next-frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### **Option B: Vanilla JavaScript Frontend**
```bash
npm start
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Initial Setup
1. The app will automatically create sample events and populate team members
2. Share the URL with your band members
3. Members can select their name and set availability
4. Use the admin features to manage events and export data

## 🎯 Team Configuration

The app comes pre-configured with 19 members across 5 roles:

- **Vocals** (6): John Smith, Jane Doe, Mike Johnson, Sarah Wilson, etc.
- **Guitar** (4): Chris Brown, Lisa Garcia, Alex Martinez, etc.
- **Bass** (3): Ryan Davis, Emma Thompson, etc.
- **Drums** (3): Tyler Anderson, Maya Rodriguez, etc.
- **Keys** (3): Jordan Taylor, Ashley Clark, etc.

*Members are automatically loaded from the Supabase database*

## ⌨️ Keyboard Shortcuts

### **Next.js Frontend**
| Key | Action |
|-----|--------|
| `Ctrl+S` / `Cmd+S` | Save pending changes |
| `Ctrl+Z` / `Cmd+Z` | Undo last change |
| `Escape` | Clear selection |
| `A` | Set Available |
| `U` | Set Unavailable |
| `?` | Set Uncertain |

### **Vanilla Frontend**
| Key | Action |
|-----|--------|
| `A` | Set Available |
| `U` | Set Unavailable |
| `?` | Set Uncertain |
| `Shift + A` | Bulk set Available |
| `Shift + U` | Bulk set Unavailable |

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in Safari/Chrome
2. Tap "Add to Home Screen" when prompted
3. App appears as native app icon

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click to install as desktop app
3. App opens in dedicated window

## 🗂️ Project Structure

```
myBand/
├── next-frontend/                 # 🆕 Next.js 14 Frontend
│   ├── app/
│   │   ├── page.tsx              # Homepage with navigation
│   │   ├── availability/         # Availability management page
│   │   ├── stats/               # Statistics dashboard  
│   │   └── layout.tsx           # Root layout with navigation
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── navigation.tsx       # App navigation
│   │   └── *.tsx               # Feature components
│   ├── hooks/
│   │   ├── use-availability.ts  # Advanced availability management
│   │   └── use-keyboard-shortcuts.ts # Global hotkeys
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── api-hooks.ts        # React hooks for API
│   │   ├── types.ts            # TypeScript definitions
│   │   └── utils.ts            # Utility functions
│   └── package.json            # Next.js dependencies
├── server/
│   ├── server.js               # Express server with API endpoints
│   └── db.js                   # Supabase database configuration
├── src/                        # 📱 Vanilla JavaScript Frontend
│   ├── app.js                  # Main application logic
│   ├── dom.js                  # DOM utilities
│   ├── storage.js              # Local storage utilities
│   └── export.js               # Data export functionality
├── data/
│   ├── members.json            # Default member configuration
│   └── availability.json       # Sample availability data
├── test/
│   └── run-tests.js            # Basic functionality tests
├── index.html                  # Main interface with glass morphism UI
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker for offline capability
├── package.json                # Dependencies and scripts
├── supabase-setup.sql          # Database setup script
└── .env.example                # Environment configuration template
```

## 🛠️ Technology Stack

### **Backend (Shared)**
- **Server**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **API**: RESTful endpoints with comprehensive coverage

### **Next.js Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Custom React hooks with optimistic updates
- **UI**: Glass morphism with modern components

### **Vanilla Frontend**
- **Language**: Modern JavaScript (ES6+)
- **Styling**: CSS with glass morphism design
- **PWA**: Service Worker + Web App Manifest
- **Storage**: Local storage with sync

## 📊 Next.js Frontend Features

### **🎯 Pages**
- **Homepage** (`/`) - Overview with navigation and quick actions
- **Availability** (`/availability`) - Full availability management with bulk operations
- **Statistics** (`/stats`) - Comprehensive analytics and response patterns

### **🔧 Advanced Hooks**
- **useAvailability** - Optimistic updates, pending changes, undo functionality
- **useKeyboardShortcuts** - Global hotkeys (Ctrl+S, Ctrl+Z, Escape)
- **API Hooks** - Automatic data fetching, error handling, health monitoring

### **📊 Statistics Dashboard**
- **Role-based analytics** - Response rates by instrument/role
- **Event coverage analysis** - Identify under-staffed events
- **Recent activity tracking** - Monitor team engagement
- **Response rate trends** - Track team participation over time

### **⚡ Performance Features**
- **Optimistic updates** - Instant UI feedback
- **Pending changes indicator** - Visual feedback for unsaved changes
- **Undo functionality** - Mistake recovery with Ctrl+Z
- **Auto-save** - Changes saved automatically
- **Error boundaries** - Graceful error handling

## 📊 Planning Center Integration

The app exports data in the exact format needed for Planning Center scheduling:

1. Click "Export CSV" in admin panel
2. Copy the generated CSV data
3. Import into Planning Center scheduling
4. Columns map to: `date,bassist,drummer,pianist,lead,bv1,bv2`
5. Values: `A` (Available), `U` (Unavailable), blank (Unknown)

### Planning Center Workflow
1. Set upcoming service dates in the app
2. Share URL with band members for responses
3. Filter for dates where all critical roles are available
4. Export CSV and import into Planning Center for scheduling

## 📊 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/members` | GET | Get all team members |
| `/api/members/by-role` | GET | Get members organized by role |
| `/api/events` | GET | Get all events |
| `/api/availability` | GET/POST | Get/set availability data |
| `/api/admin/events` | POST | Create new event (admin) |
| `/api/export/csv` | GET | Export CSV for Planning Center |

## 🚀 Deployment

The app is ready to deploy to various platforms:

### Railway
1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
3. Deploy automatically

> **Railway Environment Variables:** Make sure to set your Supabase credentials in the Railway dashboard under Variables tab.

### Render
1. Connect GitHub repo to Render
2. Configure environment variables
3. Deploy with automatic builds

### Vercel
1. Connect GitHub repo to Vercel
2. Add environment variables
3. Deploy with serverless functions

See `DEPLOY.md` for detailed deployment instructions.

## 🔧 Development

### Running Tests
```bash
npm test
```

### Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `PORT`: Server port (default: 5173)
- `NODE_ENV`: Environment (development/production)

### Database Schema
The app uses four main tables:

- `members`: Team member information
- `events`: Service dates and details
- `availability`: Member availability responses
- `settings`: Application configuration

## 📊 Data Model

The availability data structure:

```jsonc
// availability record shape
{
  "dates": ["2025-09-07", "2025-09-14"],
  "members": {"bassist":"Alice", "drummer":"Bob", ...},
  "availability": {
    "2025-09-07": { 
      "bassist":"A", 
      "drummer":"U", 
      "pianist":"?", 
      "lead":"A", 
      "bv1":"A", 
      "bv2":"?" 
    }
  }
}
```

**States:** `A` (Available), `U` (Unavailable), `?` (Unknown/not answered yet)

## 🔧 Configuration

### Admin Password
Default: `band2025`
- Change in Supabase settings table
- Or update environment variables

### Team Members
Members are managed through the Supabase database:
- Add/remove members via admin interface
- Modify role assignments as needed
- Data persists across server restarts

## 📈 Migration Guide

### **From Vanilla to Next.js**

The Next.js frontend provides a modern, enhanced experience while maintaining full compatibility with the existing backend:

1. **All original features preserved** - No functionality lost
2. **Enhanced UX** - Better keyboard shortcuts, undo, optimistic updates
3. **Modern architecture** - TypeScript, React hooks, component library
4. **Better maintainability** - Clean code structure, type safety
5. **Future-ready** - Extensible architecture for new features

### **Migration Steps Completed**
- ✅ **Step 2A**: TypeScript types and utilities
- ✅ **Step 2B**: API client and React hooks  
- ✅ **Step 2C**: shadcn/ui component library
- ✅ **Step 2D**: Advanced hooks and UX patterns
- ✅ **Step 2E**: Complete application pages

## 📈 Future Enhancements

- **Authentication**: Individual user accounts
- **Notifications**: Email alerts for new events  
- **Calendar Integration**: Google Calendar sync
- **Advanced Analytics**: Response pattern analysis
- **Theme Customization**: Multiple UI themes
- **Multi-language Support**: Localization

## 🎵 Ready for Your Worship Team

This Band Availability System provides both traditional and modern solutions for coordinating your worship team's availability. Choose the vanilla JavaScript frontend for immediate production use, or the Next.js frontend for a cutting-edge experience with advanced features.

Both frontends share the same robust Supabase backend, ensuring reliable data storage and real-time updates for your entire team.

## 📄 License

MIT License - See LICENSE file for details

---

*Built with ❤️ for worship teams everywhere*
