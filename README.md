# 🎵 Band Availability System

A modern, production-ready web application for managing worship team availability with a beautiful glass morphism UI, keyboard shortcuts, bulk operations, PWA capabilities, and Supabase backend.

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
- Node.js 16+ installed
- Supabase account (free tier available)

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

### 4. Start the Application
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
├── server/
│   ├── server.js          # Express server with API endpoints
│   └── db.js              # Supabase database configuration
├── src/
│   ├── app.js             # Main application logic
│   ├── dom.js             # DOM utilities
│   ├── storage.js         # Local storage utilities
│   └── export.js          # Data export functionality
├── data/
│   ├── members.json       # Default member configuration
│   └── availability.json  # Sample availability data
├── test/
│   └── run-tests.js       # Basic functionality tests
├── index.html             # Main interface with glass morphism UI
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker for offline capability
├── package.json           # Dependencies and scripts
├── supabase-setup.sql     # Database setup script
└── .env.example           # Environment configuration template
```

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vanilla JavaScript + Modern CSS
- **UI**: Glass Morphism design with CSS backdrop-filter
- **PWA**: Service Worker + Web App Manifest
- **Hosting**: Ready for Railway, Render, Vercel, or any Node.js host

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
2. Add environment variables in Railway dashboard
3. Deploy automatically

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

## 📈 Future Enhancements

- **Authentication**: Individual user accounts
- **Notifications**: Email alerts for new events  
- **Calendar Integration**: Google Calendar sync
- **Advanced Analytics**: Response pattern analysis
- **Theme Customization**: Multiple UI themes
- **Multi-language Support**: Localization

## 🎵 Ready for Your Worship Team

This Band Availability System provides a modern, professional solution for coordinating your worship team's availability. The glass morphism UI creates a beautiful user experience while the Supabase backend ensures reliable data storage and real-time updates.

## 📄 License

MIT License - See LICENSE file for details

---

*Built with ❤️ for worship teams everywhere*
