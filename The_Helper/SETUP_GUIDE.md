# 🚀 Black Gold Health - Complete Setup Guide

Complete step-by-step guide to set up and run the Black Gold Health emergency healthcare platform.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Production Deployment](#production-deployment)

## Prerequisites

### Required Software
- **Node.js** 16 or higher ([Download](https://nodejs.org/))
- **MongoDB** 4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
- **npm** (comes with Node.js) or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)

### Optional Services
- **Twilio** account for SMS notifications ([Sign up](https://www.twilio.com/try-twilio))
- **Gmail** account for email notifications
- **MongoDB Atlas** for cloud database ([Sign up](https://www.mongodb.com/cloud/atlas))

## Quick Start

### Option 1: Local Development (Fastest)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Start MongoDB (if using local)
# Windows: mongod
# Mac/Linux: sudo service mongod start

# 4. Seed database
node seed.js

# 5. Start backend
npm run dev
```

Backend will run on `http://localhost:5000`

```bash
# 6. In a new terminal, navigate to frontend
cd frontend

# 7. Start a simple HTTP server
# Using Python:
python -m http.server 8000

# OR using Node.js:
npx http-server -p 8000
```

Frontend will run on `http://localhost:8000`

### Option 2: MongoDB Atlas (Cloud Database)

If you don't want to install MongoDB locally:

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/black-gold-health
   ```
5. Continue with steps 2-7 from Option 1

## Detailed Setup

### Step 1: Install MongoDB

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service
5. MongoDB Compass (GUI) is optional

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Install Node.js

1. Download from [nodejs.org](https://nodejs.org/)
2. Choose LTS version (recommended)
3. Run installer
4. Verify installation:
   ```bash
   node --version  # Should show v16 or higher
   npm --version   # Should show v8 or higher
   ```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd black-gold-health/backend

# Install all dependencies
npm install

# This installs:
# - express (web framework)
# - mongoose (MongoDB ORM)
# - socket.io (real-time communication)
# - bcryptjs (password hashing)
# - jsonwebtoken (authentication)
# - and more...

# Verify .env file exists
cat .env

# If not, copy from example
cp .env.example .env

# Edit .env if needed (optional for local development)
# The default values work for local MongoDB
```

### Step 4: Seed Database

```bash
# Still in backend directory
node seed.js

# You should see:
# ✅ Connected to MongoDB
# ✅ Inserted 5 hospitals
# ✅ Inserted 3 pharmacies
# 🎉 Database seeded successfully!
```

This creates sample data:
- 5 hospitals in Kolkata area
- 3 pharmacies
- Test login: `contact@citygeneralhospital.com` / `hospital123`

### Step 5: Start Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR production mode
npm start

# You should see:
# 🚀 Black Gold Health API Server Started
# 📍 Server: http://localhost:5000
# 🏥 Health Check: http://localhost:5000/health
# 📡 Socket.IO: Ready
```

Keep this terminal window open!

### Step 6: Frontend Setup

Open a NEW terminal window:

```bash
# Navigate to frontend directory
cd black-gold-health/frontend

# Start HTTP server
# Option A - Python (if installed)
python -m http.server 8000

# Option B - Node.js
npx http-server -p 8000

# Option C - VS Code Live Server
# Install "Live Server" extension
# Right-click index.html > "Open with Live Server"
```

Frontend will be available at:
- `http://localhost:8000`
- or `http://127.0.0.1:8000`

## Testing

### 1. Backend Health Check

Open browser and visit:
```
http://localhost:5000/health
```

Should see:
```json
{
  "success": true,
  "message": "Black Gold Health API is running",
  "timestamp": "2024-04-22T..."
}
```

### 2. Frontend Test

1. Open `http://localhost:8000` in browser
2. Should see Black Gold Health homepage
3. Click "Register" and create account
4. Login with your credentials

### 3. SOS Test Flow

**Prerequisites**: Ensure location services are enabled in your browser

1. **Register/Login as User**:
   - Open `http://localhost:8000`
   - Register new account
   - Login

2. **Trigger SOS**:
   - Click big orange "SOS EMERGENCY" button
   - Allow location access when prompted
   - System will find nearby hospitals
   - You'll see list of notified hospitals

3. **Hospital Dashboard** (separate browser/incognito):
   - Open `http://localhost:8000/hospital-dashboard.html`
   - Login with: `contact@citygeneralhospital.com` / `hospital123`
   - Should see incoming SOS alert
   - Click "Accept" to respond

4. **Back to User**:
   - Should see hospital responded
   - Hospital details displayed
   - Can cancel or mark as resolved

### 4. Other Features Test

**Hospital Finder**:
- Visit `http://localhost:8000/hospital-finder.html`
- Allow location access
- See nearby hospitals with filters

**Pharmacy Finder**:
- Visit `http://localhost:8000/pharmacy-finder.html`
- Search for pharmacies
- Filter by 24-hour, delivery, etc.

**Prescription Organizer**:
- Login required
- Visit `http://localhost:8000/prescription-organiser.html`
- Add prescriptions
- Set reminders

**Wellness Tracker**:
- Visit `http://localhost:8000/wellness-tips.html`
- Track water, steps, sleep, calories
- View wellness tips

## Troubleshooting

### MongoDB Connection Failed

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solutions**:
1. Check if MongoDB is running:
   ```bash
   # Windows
   services.msc (look for MongoDB)
   
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status mongod
   ```

2. Start MongoDB:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. Check `.env` MONGO_URI is correct

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solutions**:
1. Kill process using port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

2. Or change port in `.env`:
   ```
   PORT=5001
   ```

### Socket.IO Not Connecting

**Check**:
1. Backend is running
2. Frontend API_BASE URL is correct
3. CORS settings in backend `.env`
4. Browser console for errors

### Geolocation Not Working

**Solutions**:
1. Use HTTPS in production (required for geolocation)
2. For local development, use `localhost` not `127.0.0.1`
3. Enable location in browser settings
4. Check browser console for permission errors

### Email/SMS Not Sending

This is **OPTIONAL** and the app works without it.

To enable:
1. Get Twilio credentials from [twilio.com](https://www.twilio.com)
2. Get Gmail app password from Google account
3. Update `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxx
   TWILIO_AUTH_TOKEN=xxxx
   TWILIO_PHONE=+1234567890
   
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Can't Access from Other Devices

**For LAN testing**:

1. Find your local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update backend `.env`:
   ```
   ALLOWED_ORIGINS=http://192.168.1.100:8000
   ```

3. Access from other device:
   ```
   http://192.168.1.100:8000
   ```

## Production Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
# Then:

cd backend

# Login
heroku login

# Create app
heroku create black-gold-health-api

# Add MongoDB
heroku addons:create mongodbatlas:M0

# Set environment variables
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend.com

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a black-gold-health-api
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment (Netlify/Vercel)

1. Update API_BASE in all HTML files:
   ```javascript
   const API_BASE = 'https://your-backend.herokuapp.com/api';
   ```

2. Deploy to Netlify:
   - Drag & drop `frontend/` folder
   - Or connect GitHub repo
   - Auto-deploy on push

3. Update backend CORS:
   ```
   ALLOWED_ORIGINS=https://your-site.netlify.app
   ```

### MongoDB Atlas (Production Database)

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP addresses or allow all (0.0.0.0/0)
3. Get connection string
4. Update backend:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ```

## 📞 Getting Help

### Check Logs

Backend logs:
```bash
cd backend
cat logs/error.log
cat logs/combined.log
```

Frontend errors:
- Open browser DevTools (F12)
- Check Console tab
- Check Network tab for API calls

### Common Solutions

1. **Clear cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Restart services**: Stop and start backend/frontend
3. **Check versions**: Node.js 16+, MongoDB 4.4+
4. **Reinstall**: `rm -rf node_modules && npm install`

## ✅ Success Checklist

- [ ] MongoDB installed and running
- [ ] Node.js 16+ installed
- [ ] Backend dependencies installed
- [ ] Database seeded successfully
- [ ] Backend server running on :5000
- [ ] Frontend server running on :8000
- [ ] Can access homepage
- [ ] Can register/login
- [ ] Can trigger SOS
- [ ] Hospital dashboard receives alerts
- [ ] Socket.IO connecting properly

---

**🎉 Congratulations! Your Black Gold Health platform is ready!**

For support: Check logs, review documentation, or file an issue.
