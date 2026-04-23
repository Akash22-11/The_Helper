# 🚀 Black Gold Health - Quick Reference Card

## ⚡ Quick Start (30 seconds)

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

## 🔗 URLs

- **Frontend**: http://localhost:8000
- **Backend**: http://localhost:5000
- **Health**: http://localhost:5000/health

## 🔑 Test Login

**Hospital Dashboard:**
- Email: `contact@citygeneralhospital.com`
- Password: `hospital123`

## 📡 API Base

```javascript
const API_BASE = 'http://localhost:5000/api';
```

## 🚨 SOS Flow (30 seconds)

1. Open http://localhost:8000
2. Register/Login
3. Click "SOS EMERGENCY"
4. Allow location
5. See hospital list

## 🏥 Hospital Response (30 seconds)

1. Open http://localhost:8000/hospital-dashboard.html
2. Login with test credentials
3. See SOS alert
4. Click "Accept"

## 📋 File Checklist

- [ ] `backend/package.json` - Dependencies
- [ ] `backend/.env` - Configuration
- [ ] `backend/server.js` - Main server
- [ ] `backend/seed.js` - Sample data
- [ ] `frontend/*.html` - 7 pages

## 🔧 Environment Variables

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/black-gold-health
JWT_SECRET=your_secret
```

## 📊 Database Collections

- **users** - User accounts
- **hospitals** - Hospital accounts
- **sosalerts** - Emergency alerts
- **pharmacies** - Pharmacy listings

## 🎯 Key Commands

```bash
# Install dependencies
cd backend && npm install

# Seed database
node seed.js

# Start dev server
npm run dev

# Start production
npm start

# Verify project
./verify.sh
```

## 🐛 Troubleshooting

### MongoDB not running?
```bash
# Mac
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### Port 5000 in use?
```bash
# Change in .env
PORT=5001
```

### Can't find MongoDB?
```bash
# Use MongoDB Atlas (free)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

## 📚 Documentation

- **Main**: `README.md`
- **Setup**: `SETUP_GUIDE.md`
- **Backend**: `backend/README.md`
- **Architecture**: `ARCHITECTURE.md`

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Enable CORS only for your domain
- Keep `.env` file secret

## 📞 Common Issues

**Socket.IO not connecting?**
→ Check backend is running on port 5000

**Geolocation not working?**
→ Use `localhost` not `127.0.0.1`

**Email/SMS not sending?**
→ Optional - app works without them

## ✅ Success Indicators

- ✅ Backend logs show "Server running"
- ✅ Frontend shows landing page
- ✅ Health check returns JSON
- ✅ Can register/login
- ✅ SOS button works
- ✅ Hospital dashboard receives alerts

## 🎉 You're Ready!

Visit: **http://localhost:8000**

---

**Need help?** See `SETUP_GUIDE.md` for detailed instructions.
