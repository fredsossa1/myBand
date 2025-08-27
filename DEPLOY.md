# 🚀 Deployment Guide

Complete guide to deploy your Band Availability System to production.

## 🎯 Recommended: Railway + Supabase (Free Tier)

### Step 1: Set up Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create account
   - Click "New Project" and choose organization
   - Set project name, database password, and region

2. **Create Database Tables**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the entire contents of `supabase-setup.sql`
   - Paste and execute in the SQL editor
   - Verify tables created: members, events, availability, settings

3. **Get Connection Details**
   - Go to Settings → API in your Supabase dashboard
   - Copy your Project URL and anon public key
   - Save these for deployment environment variables

### Step 2: Deploy to Railway

1. **Prepare Repository**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/band-availability.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app) and sign up
   - Click "Deploy from GitHub repo"
   - Connect your repository
   - Railway auto-detects Node.js and deploys

3. **Set Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these variables:

   ```bash
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   PORT=3000
   ```

4. **Get Your URL**
   - Railway provides a public URL automatically
   - Share this URL with your worship team

## 🌐 Alternative Deployment Options

### Option 2: Render + Supabase

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Same as Railway above

### Option 3: Vercel + Supabase

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set Environment Variables**

   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   ```

## ⚙️ Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon public key | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `PORT` | Server port (optional) | `3000` |

### Local Development

Create `.env` file:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
PORT=5173
```

## 🔐 Admin Setup

### Default Credentials

- **Admin Password**: `band2025`
- **Access**: Click "🔐 Admin" button in top-right corner

### Change Admin Password

**Option 1: Update in Database**

1. Go to Supabase dashboard → Table Editor → settings
2. Edit the row where key = 'adminPassword'
3. Change value to your new password

**Option 2: Update in Code**

1. Edit `server/db.js`
2. Find: `adminPassword: 'band2025'`
3. Change to: `adminPassword: 'your-new-password'`
4. Redeploy

## 📱 How to Use After Deployment

### For Worship Team Members

1. **Visit the shared URL** (your deployment URL)
2. **Select your name** from the dropdown (organized by role)
3. **Set availability** by clicking the buttons for each event
   - ✅ Green = Available
   - ❌ Red = Unavailable  
   - ❓ Gray = Uncertain
4. **Changes save automatically** - no account needed

### For Admins

1. **Click "🔐 Admin"** and enter password
2. **Add events** with dates, titles, and descriptions
3. **Use bulk add** for recurring weekly services
4. **Export CSV** for Planning Center scheduling
5. **Monitor responses** with built-in statistics

## 📊 Planning Center Integration

1. **Export Data**
   - Click "Export CSV" in admin panel
   - Copy the generated CSV content

2. **Import to Planning Center**
   - Go to Planning Center Services
   - Import the CSV data for scheduling
   - Columns: date, bassist, drummer, pianist, lead, bv1, bv2
   - Values: A (Available), U (Unavailable), blank (Unknown)

## 🔧 Customization

### Update Team Members

1. Edit `data/members.json` on your local copy
2. Commit and push changes
3. Railway/Render will auto-deploy updates

### Styling Changes

1. Modify CSS in `index.html`
2. Update PWA colors in `manifest.json`
3. Deploy updates via git push

## 🆘 Troubleshooting

### Common Issues

**App won't start**
- Check environment variables are set correctly
- Verify Supabase URL and key are valid
- Check Railway/Render build logs

**Database errors**
- Ensure `supabase-setup.sql` was run completely
- Check Supabase dashboard for table creation
- Verify connection string format

**Can't access admin**
- Default password is `band2025`
- Check if password was changed in database/code
- Clear browser cache and try again

**Team members can't access**
- Share the public deployment URL (not localhost)
- Check that deployment is running
- Verify no typos in shared URL

### Debug Steps

1. **Check Deployment Logs**
   - Railway: Project → Deployments → View Logs
   - Render: Service → Logs tab

2. **Test Database Connection**
   - Visit `/api/members` endpoint
   - Should return JSON array of team members

3. **Verify Environment**
   - Check all required variables are set
   - Confirm Supabase project is active

## 🔒 Security Considerations

### Production Security

- **Admin Access**: Simple password-based (suitable for small teams)
- **Data Access**: Anyone with URL can view/edit (by design)
- **Database**: Supabase handles encryption and backups
- **Hosting**: HTTPS provided by Railway/Render/Vercel

### For Enterprise Use

Consider adding:
- Individual user authentication
- Role-based permissions
- Audit logging
- Rate limiting

## � Success Checklist

After deployment, verify:

- [ ] App loads at deployment URL
- [ ] Admin login works with password
- [ ] Can create new events
- [ ] Team members can set availability
- [ ] CSV export generates correct format
- [ ] Data persists across deployments
- [ ] Mobile interface works properly
- [ ] PWA installation prompts appear

## 📈 Next Steps

Your Band Availability System is now live and ready for your worship team:

1. **Share the URL** with all team members
2. **Create upcoming service dates** via admin panel
3. **Monitor response rates** using built-in statistics
4. **Export regularly** for Planning Center integration
5. **Enjoy streamlined** worship team coordination!

---

**🎵 Your worship team coordination just got a major upgrade!**
