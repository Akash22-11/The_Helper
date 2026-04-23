# 🚑 Black Gold Health - Emergency Healthcare Platform

A complete, production-ready emergency healthcare platform with real-time SOS functionality, hospital finder, pharmacy locator, prescription management, and wellness tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.4-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

### 🚨 Emergency SOS System
- One-tap emergency alert activation
- Automatic GPS location capture
- Finds hospitals within 5km radius
- Real-time notifications (SMS, Email, Socket.IO)
- Patient medical profile sharing
- Hospital response tracking
- Live ETA updates

### 🏥 Hospital Finder
- Geolocation-based search
- Filter by specialization, services, bed availability
- Real-time distance calculation
- Ratings and reviews
- Direct calling and navigation

### 💊 Pharmacy Finder
- Find nearby pharmacies
- Filter: 24-hour, delivery, homeopathy
- Online ordering capability
- Vaccination and lab test services

### 📋 Prescription Organizer
- Upload and manage prescriptions
- Medication reminders
- Dosage schedules
- Refill tracking
- Share with doctors

### 🌱 Wellness Tracker
- Daily health metrics (water, steps, sleep, calories)
- Progress visualization
- Wellness tips and advice
- Goal tracking

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB** 4.4+ ([Download](https://www.mongodb.com/try/download/community))
- Modern web browser

### One-Command Start

```bash
# Mac/Linux
./start.sh

# Windows
start.bat
```

### Manual Setup

```bash
# 1. Start MongoDB
mongod

# 2. Setup Backend
cd backend
npm install
node seed.js
npm run dev

# 3. Setup Frontend (new terminal)
cd frontend
python -m http.server 8000
```

**Access the application:**
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
black-gold-health/
├── frontend/                    # Frontend files
│   ├── index.html              # Landing page with SOS
│   ├── sos-active.html         # Active emergency interface
│   ├── hospital-dashboard.html # Hospital staff dashboard
│   ├── hospital-finder.html    # Find hospitals
│   ├── pharmacy-finder.html    # Find pharmacies
│   ├── prescription-organiser.html
│   └── wellness-tips.html
│
├── backend/                     # Backend API
│   ├── models/                 # Database models
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth & validation
│   ├── utils/                  # Helpers
│   ├── config/                 # Configuration
│   ├── server.js              # Main server
│   ├── seed.js                # Sample data
│   └── package.json
│
├── SETUP_GUIDE.md              # Detailed setup
├── README.md                   # This file
├── start.sh                    # Startup script (Mac/Linux)
└── start.bat                   # Startup script (Windows)
```

## 🔧 Technology Stack

### Frontend
- Pure HTML/CSS/JavaScript
- Socket.IO Client
- Geolocation API
- Notification API
- Mobile-first responsive design

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time)
- JWT Authentication
- bcrypt (password hashing)
- Winston (logging)
- Nodemailer (email)
- Twilio (SMS)

## 📡 API Quick Reference

### Base URL: `http://localhost:5000/api`

```http
# Authentication
POST /api/auth/user/register
POST /api/auth/user/login
POST /api/auth/hospital/login

# SOS Emergency
POST /api/sos/trigger
GET  /api/sos/:id/status
POST /api/sos/:id/cancel
POST /api/sos/:id/hospital/accept

# User & Medical
GET  /api/user/profile
POST /api/user/prescriptions
PUT  /api/user/wellness

# Search
GET  /api/hospitals/nearby
GET  /api/pharmacies/nearby
```

**Full API docs:** See `backend/README.md`

## 🧪 Testing

### Sample Login Credentials

After running `node seed.js`:

**Hospital Dashboard:**
- Email: `contact@citygeneralhospital.com`
- Password: `hospital123`

**Sample Data Created:**
- 5 hospitals in Kolkata area
- 3 pharmacies with different services
- All with geospatial coordinates

### Test SOS Flow

1. **User Side:**
   - Open http://localhost:8000
   - Register/Login
   - Click "SOS EMERGENCY" button
   - Allow location access
   - See notified hospitals

2. **Hospital Side:**
   - Open http://localhost:8000/hospital-dashboard.html (different browser/incognito)
   - Login with hospital credentials
   - See incoming SOS alert
   - Click "Accept"

3. **Real-time Update:**
   - User sees hospital response instantly
   - Connection via Socket.IO

## 🛡️ Security

- Password hashing with bcrypt
- JWT authentication (30-day tokens)
- Rate limiting (10 SOS per 15 min)
- CORS protection
- Input validation
- Security headers (Helmet.js)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS/Android)

## 🚀 Deployment

### Backend (Heroku Example)

```bash
cd backend
heroku create black-gold-health-api
heroku addons:create mongodbatlas:M0
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production
git push heroku main
```

### Frontend (Netlify)

1. Update `API_BASE` in all HTML files to your Heroku URL
2. Deploy frontend folder to Netlify
3. Update backend CORS with Netlify URL

**Detailed guide:** See `SETUP_GUIDE.md`

## 🔧 Configuration

### Environment Variables (`backend/.env`)

```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/black-gold-health
JWT_SECRET=your_secret_key
ALLOWED_ORIGINS=http://localhost:8000

# Optional (app works without these)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SMTP_USER=
SMTP_PASS=
```

### Design Customization

Edit CSS variables in any HTML file:

```css
:root {
  --accent1: #ff6a00;  /* Orange */
  --accent2: #ee0979;  /* Pink */
  --bg: #0a0d0f;       /* Dark background */
}
```

## 🐛 Troubleshooting

### MongoDB not connecting?
```bash
# Check if running
mongod --version

# Start it
# Mac: brew services start mongodb-community
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
```

### Port 5000 in use?
```bash
# Change in backend/.env
PORT=5001
```

### Socket.IO not working?
- Verify backend is running
- Check browser console
- Verify CORS settings in .env

**Full troubleshooting:** See `SETUP_GUIDE.md`

## 📚 Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Step-by-step installation
- **Backend API**: `backend/README.md` - Complete API reference
- **Original Docs**: `frontend/README.md` - Frontend documentation

## ⚠️ Important Notes

### Optional Services

**Email & SMS are OPTIONAL** - The app works without them:
- Real-time updates use Socket.IO (always works)
- Email/SMS enhance notification delivery
- Configure Twilio/SMTP in `.env` to enable

### Location Services

- Required for SOS and finding nearby facilities
- Enable in browser settings
- HTTPS required in production

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Use MongoDB Atlas (cloud database)
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up email/SMS services
- [ ] Update all `API_BASE` URLs in frontend
- [ ] Test thoroughly

## 🎯 Project Status

**Current Version:** 1.0.0

**Working Features:**
- ✅ User registration/authentication
- ✅ Hospital registration/authentication  
- ✅ SOS emergency trigger
- ✅ Real-time Socket.IO notifications
- ✅ Geospatial hospital/pharmacy search
- ✅ Prescription management
- ✅ Wellness tracking
- ✅ Hospital dashboard

**Future Enhancements:**
- Mobile apps (React Native)
- Video consultation
- Ambulance GPS tracking
- Insurance integration
- Multi-language support
- AI diagnosis assistant

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFeature`
3. Commit changes: `git commit -m 'Add NewFeature'`
4. Push to branch: `git push origin feature/NewFeature`
5. Submit Pull Request

## 📞 Support

**Having issues?**

1. Check `backend/logs/error.log`
2. Review `SETUP_GUIDE.md`
3. Open browser DevTools (F12) → Console tab
4. Verify MongoDB is running
5. Check all environment variables

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

- MongoDB for geospatial capabilities
- Socket.IO for real-time magic
- Twilio for SMS integration
- All healthcare workers worldwide

---

## 🎉 Ready to Go!

```bash
# Start everything with one command:
./start.sh

# Then visit:
http://localhost:8000
```

**Built with ❤️ for saving lives**

Version 1.0.0 | April 2026
