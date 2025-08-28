# Band Availability System - Project Documentation

## 📋 Project Overview

A modern web application for managing worship team availability. Built with Node.js, Express, and Supabase as the database backend. Features a clean, production-ready interface for team members to set their availability and for admins to manage events.

## 🚀 Current Status

✅ **Fully Functional System**
- Production-ready Supabase database with all tables created
- Clean, responsive web interface
- Admin system with modal-based access
- Real-time availability tracking
- Export functionality (CSV & Summary)

## 🏗️ Architecture

### **Backend (Node.js + Express)**
- **Server**: `server/server.js` - Main Express server
- **Database**: `server/db.js` - Supabase integration and data management
- **Port**: 5173 (configurable via PORT env var)

### **Frontend (Vanilla JavaScript)**
- **HTML**: `index.html` - Modern, responsive design
- **JavaScript**: `src/app.js` - Application logic
- **Utilities**: `src/dom.js` - DOM manipulation helpers

### **Database (Supabase)**
- **URL**: https://rwcsctgzntxyadmpsllj.supabase.co
- **Tables**: members, events, availability, settings
- **Authentication**: Admin password-based system

## 📊 Database Schema

### **Members Table**
```sql
- id (TEXT PRIMARY KEY) - Unique member identifier
- name (TEXT) - Full name
- role (TEXT) - Instrument/role (pianist, lead, bv, bassist, drummer)
- created_at (TIMESTAMP) - Creation timestamp
```

### **Events Table**
```sql
- id (SERIAL PRIMARY KEY) - Auto-incrementing ID
- date (DATE UNIQUE) - Event date
- title (TEXT) - Event title (default: 'Service')
- description (TEXT) - Event description
- type (TEXT) - Event type (default: 'service')
- created_at (TIMESTAMP) - Creation timestamp
```

### **Availability Table**
```sql
- id (SERIAL PRIMARY KEY) - Auto-incrementing ID
- date (DATE) - Event date (foreign key to events)
- person_id (TEXT) - Member ID (foreign key to members)
- state (TEXT) - Availability state: 'A' (Available), 'U' (Unavailable), '?' (Uncertain)
- created_at (TIMESTAMP) - Creation timestamp
- UNIQUE(date, person_id) - One response per person per event
```

### **Settings Table**
```sql
- key (TEXT PRIMARY KEY) - Setting name
- value (TEXT) - Setting value
- created_at (TIMESTAMP) - Creation timestamp
```

## 👥 Current Team Data

**18 Team Members across 5 roles:**

### **Pianists (3)**
- Guillaume Chambaud (piano1)
- Zack Kanku (piano2)
- Elisee Vou Bi (piano3)

### **Lead Singers (4)**
- Linda Claude K. (lead1)
- Melina Ossibi (lead2)
- Sherley Jean Baptiste (lead3)
- Daniel Tatala (lead4)

### **Background Vocals (6)**
- Ketsia Joseph (bv1)
- Merveille Narri (bv2)
- Naomi Makosso-Tchivongo (bv3)
- Shirley Bille-Bioum (bv4)
- Esther Dicka (bv5)
- Michaëlle Moron (bv6)
- Dorcas Tatala (bv7)

### **Bassists (3)**
- Josue Tatala (bass1)
- Freddy Sossa (bass2)
- Michee Sinare (bass3)

### **Drummers (2)**
- Gaïus Libam (drum1)
- Yves Junior Zogho (drum2)

## 📅 Current Events

**5 Upcoming Services:**
1. **Aug 29, 2025** - Toronto Band (Lounge avec l'équipe de jeunes en provenance de Toronto)
2. **Sep 6, 2025** - GC Jam (Jam de l'équipe de louange)
3. **Sep 21, 2025** - Louange au Campus (Agir : Louange du dimanche matin à l'église le Campus)
4. **Oct 26, 2025** - Louange au Campus (+ Pratique générale soirée de Louange)
5. **Oct 31, 2025** - Soirée de Louange Campus (HALLOWED BE YOUR NAME)

## 🔐 Admin System

### **Access Credentials**
- **Password**: `band2025`
- **Access Method**: Click "🔐 Admin" button in top-right corner

### **Admin Capabilities**
- ✅ Add new events with titles and descriptions
- ✅ Export availability data (CSV format)
- ✅ Export summary reports (text format)
- ✅ Reset all availability data
- ✅ View comprehensive statistics
- ✅ See all team responses organized by role

### **Admin UI Features**
- Modal-based interface (no UI clutter)
- Fixed position corner button
- Visual feedback when logged in (button turns green)
- Restricted access to sensitive functions

## 🎯 User Experience

### **Team Member Flow**
1. **Visit** http://localhost:5173
2. **Select name** from dropdown (organized by role)
3. **View all events** with dates and descriptions
4. **Set availability** by clicking buttons (Available/Unavailable/Uncertain)
5. **See responses** from other team members who have already responded

### **Key Features**
- **Clean interface** - only shows people who have responded
- **Real-time updates** - changes save immediately to Supabase
- **Mobile responsive** - works on all devices
- **Progress tracking** - shows individual and overall response rates

## 🛠️ Technical Details

### **Starting the Server**
```bash
cd /Users/krueger/Desktop/Projects/myBand
node server/server.js
```

### **Environment Configuration**
- **Production mode**: Uses Supabase (default when NODE_ENV is undefined)
- **Development mode**: Uses local JSON files (set NODE_ENV=development)

### **API Endpoints**
- `GET /api/members` - Get all team members
- `GET /api/events` - Get all events
- `GET /api/availability` - Get all availability responses
- `POST /api/availability` - Set individual availability
- `POST /api/admin/events` - Add new event (admin only)
- `GET /api/export/csv` - Export CSV data
- `GET /api/export/summary` - Export text summary
- `POST /api/reset` - Reset all data (admin only)

### **File Structure**
```
myBand/
├── server/
│   ├── server.js          # Express server
│   └── db.js              # Database layer
├── src/
│   ├── app.js             # Main application logic
│   └── dom.js             # DOM utilities
├── data/
│   ├── members.json       # Team member definitions
│   └── availability.json  # Local fallback data
├── index.html             # Main interface
├── package.json           # Dependencies
├── supabase-setup.sql     # Database setup script
└── INSTRUCTIONS.md        # This file
```

## 🔄 Data Flow

### **Availability Setting Process**
1. User selects their name → `currentUser` variable set
2. User clicks availability button → `setAvailability()` called
3. API call to `/api/availability` → Supabase database updated
4. Local state updated → UI re-renders with new data
5. Statistics updated → Progress bars and counters refresh

### **Admin Event Creation**
1. Admin logs in → `isAdmin` flag set to true
2. Admin fills event form → title, description, date
3. `addEvent()` called → API call to `/api/admin/events`
4. Supabase events table updated → `refresh()` called
5. UI updates with new event → Available for team member responses

## 🚀 Deployment Considerations

### **Production Readiness**
- ✅ Clean, professional UI design
- ✅ Responsive mobile layout
- ✅ Error handling and user feedback
- ✅ Secure admin access
- ✅ Production database (Supabase)
- ✅ Export functionality for reporting

### **Potential Enhancements**
- 🔄 User authentication (individual logins)
- 📧 Email notifications for new events
- 📱 PWA capabilities for mobile app experience
- 🔗 Calendar integration (Google Calendar, Outlook)
- 📊 Advanced analytics and reporting
- 🎨 Theme customization
- 🌐 Multi-language support

## 📝 Usage Notes

### **For Team Members**
- No account needed - just select your name
- Availability states: Available (green) / Unavailable (red) / Uncertain (gray)
- You can change your response anytime
- Only see responses from people who have already answered

### **For Administrators**
- Use admin button for all management tasks
- Export data regularly for backup/reporting
- Add events well in advance for better response rates
- Monitor response statistics to follow up with non-responders

## 🔧 Troubleshooting

### **Common Issues**
1. **Server won't start**: Check if port 5173 is available
2. **Database errors**: Verify Supabase connection and table setup
3. **No events showing**: Check if events exist in database
4. **Can't set availability**: Ensure user name is selected first

### **Database Reset**
If you need to recreate the database:
1. Go to Supabase dashboard
2. Run the contents of `supabase-setup.sql` in SQL Editor
3. Restart the server

---

## 🎵 Ready for Production!

Your Band Availability System is fully functional and ready for your worship team to use. The system provides a clean, professional interface for managing team availability while giving administrators the tools they need to coordinate services effectively.

**Next session**: You can pick up right where you left off by starting the server and accessing http://localhost:5173

Happy coding! 🎶
