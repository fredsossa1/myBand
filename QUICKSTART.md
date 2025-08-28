# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js 16+ installed
- Supabase account (free at [supabase.com](https://supabase.com))

### 2. Database Setup
```bash
# Create new Supabase project
# Copy contents of supabase-setup.sql
# Run in Supabase SQL Editor
# Note your Project URL and anon key
```

### 3. Local Development
```bash
# Install dependencies
npm install

# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-key"

# Start server
npm start
```

### 4. First Use
1. Open [http://localhost:5173](http://localhost:5173)
2. Click "🔐 Admin" (password: `band2025`)
3. Add some events
4. Share URL with team members

### 5. Deploy (Optional)
See [DEPLOY.md](DEPLOY.md) for Railway, Render, or Vercel deployment.

## 📱 Phase 1 Features

- **⌨️ Keyboard Shortcuts**: A/U/? for quick responses
- **📦 Bulk Actions**: Shift+A for multiple events
- **↩️ Undo**: Ctrl/Cmd+Z to undo mistakes
- **📱 PWA**: Install as mobile/desktop app
- **🎨 Modern UI**: Professional design with animations

## 🎯 Team Configuration

Edit `data/members.json` to match your team:

```json
{
  "pianist": [
    { "id": "piano1", "name": "Your Pianist Name" }
  ],
  "lead": [
    { "id": "lead1", "name": "Your Lead Singer" }
  ]
}
```

## 🔐 Admin Password

Default: `band2025`

To change:
1. Supabase dashboard → settings table → edit adminPassword
2. Or edit `server/db.js` and redeploy

## 📊 Export to Planning Center

1. Admin panel → Export CSV
2. Copy data
3. Import to Planning Center
4. Format: date, bassist, drummer, pianist, lead, bv1, bv2

## 🆘 Need Help?

- **Full Documentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOY.md](DEPLOY.md)  
- **Changes**: [CHANGELOG.md](CHANGELOG.md)

---

**🎵 Ready to streamline your worship team coordination!**
