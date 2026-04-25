# Black Gold Health - Backend API

Complete Node.js/Express backend for the Black Gold Health emergency healthcare platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+ (local or MongoDB Atlas)
- npm or yarn

### Installation;

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Seed database with sample data
npm run seed

# Start development server
npm run dev

# Or start production server
npm start
```

Backend will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User model
│   ├── Hospital.js          # Hospital model
│   ├── SOSAlert.js          # SOS alert model
│   └── Pharmacy.js          # Pharmacy model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── sos.js               # SOS emergency routes
│   ├── user.js              # User profile routes
│   ├── hospitals.js         # Hospital routes
│   └── pharmacies.js        # Pharmacy routes
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── utils/
│   ├── logger.js            # Winston logger
│   └── notifications.js     # Email/SMS services
├── server.js                # Main server file
├── seed.js                  # Database seeder
├── package.json
├── .env                     # Environment variables
└── .env.example             # Example env file
```

## 🔧 Environment Variables

Required variables in `.env`:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/black-gold-health

# JWT
JWT_SECRET=your_secret_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Optional: SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=

# Optional: Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Rate Limiting
MAX_SOS_PER_15MIN=10
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123",
  "bloodType": "O+",
  "dateOfBirth": "1990-01-01"
}
```

#### Login User
```http
POST /api/auth/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Register Hospital
```http
POST /api/auth/hospital/register
Content-Type: application/json

{
  "name": "City Hospital",
  "email": "hospital@example.com",
  "phone": "+911234567890",
  "password": "password123",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "address": "123 Main St"
}
```

#### Login Hospital
```http
POST /api/auth/hospital/login
Content-Type: application/json

{
  "email": "hospital@example.com",
  "password": "password123"
}
```

### SOS Emergency

#### Trigger SOS
```http
POST /api/sos/trigger
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "latitude": 22.5726,
  "longitude": 88.3639,
  "address": "Current location address"
}
```

#### Get SOS Status
```http
GET /api/sos/:alertId/status
Authorization: Bearer <token>
```

#### Cancel SOS
```http
POST /api/sos/:alertId/cancel
Authorization: Bearer <user_token>
```

#### Resolve SOS
```http
POST /api/sos/:alertId/resolve
Authorization: Bearer <user_token>
```

#### Hospital Accept SOS
```http
POST /api/sos/:alertId/hospital/accept
Authorization: Bearer <hospital_token>
Content-Type: application/json

{
  "eta": 15
}
```

#### Hospital Decline SOS
```http
POST /api/sos/:alertId/hospital/decline
Authorization: Bearer <hospital_token>
```

### User Profile

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <user_token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+919876543210",
  "bloodType": "O+",
  "medicalInfo": {
    "allergies": ["Penicillin"],
    "conditions": ["Diabetes"],
    "medications": ["Metformin"]
  }
}
```

#### Add Prescription
```http
POST /api/user/prescriptions
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "startDate": "2024-01-01",
  "reminderTime": "09:00"
}
```

#### Update Wellness Tracking
```http
PUT /api/user/wellness
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "water": 8,
  "steps": 10000,
  "sleep": 7,
  "calories": 2000
}
```

### Hospitals

#### Find Nearby Hospitals
```http
GET /api/hospitals/nearby?latitude=22.5726&longitude=88.3639&maxDistance=5000&emergency=true
```

#### Get Hospital Details
```http
GET /api/hospitals/:hospitalId
```

#### Get Hospital Dashboard Alerts
```http
GET /api/hospitals/dashboard/alerts
Authorization: Bearer <hospital_token>
```

### Pharmacies

#### Find Nearby Pharmacies
```http
GET /api/pharmacies/nearby?latitude=22.5726&longitude=88.3639&is24Hours=true
```

#### Get Pharmacy Details
```http
GET /api/pharmacies/:pharmacyId
```

## 🔌 WebSocket Events (Socket.IO)

### Client → Server

#### Authenticate
```javascript
socket.emit('authenticate', {
  token: 'jwt_token_here',
  type: 'user' // or 'hospital'
});
```

### Server → Client

#### User Events
```javascript
// Hospital responding to SOS
socket.on('sos:hospital_responding', (data) => {
  // data: { alertId, hospital: { id, name, phone }, eta }
});

// SOS cancelled
socket.on('sos:cancelled', (data) => {
  // data: { alertId }
});

// ETA update
socket.on('sos:eta_update', (data) => {
  // data: { alertId, eta }
});
```

#### Hospital Events
```javascript
// Incoming SOS alert
socket.on('sos:incoming', (data) => {
  // data: { alertId, patient, location, distance }
});

// SOS cancelled by patient
socket.on('sos:cancelled', (data) => {
  // data: { alertId }
});
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  dateOfBirth: Date,
  bloodType: String,
  medicalInfo: {
    allergies: [String],
    conditions: [String],
    medications: [String],
    emergencyContact: Object
  },
  prescriptions: [Object],
  wellnessTracking: Object,
  sosHistory: [ObjectId]
}
```

### Hospital Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],
    address: String
  },
  services: Object,
  specializations: [String],
  bedAvailability: Object,
  rating: Number,
  stats: Object
}
```

### SOSAlert Model
```javascript
{
  user: ObjectId,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],
    address: String
  },
  patientInfo: Object,
  status: String,
  notifiedHospitals: [Object],
  respondingHospital: ObjectId,
  timeline: [Object]
}
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: 30-day expiry
- **Rate Limiting**: 100 requests per 15 min
- **SOS Rate Limiting**: 10 SOS per 15 min per IP
- **Helmet.js**: Security headers
- **CORS**: Configurable origins
- **Input Validation**: express-validator
- **Error Handling**: Centralized error handler

## 📊 Logging

Winston logger with:
- Console output (development)
- File logging (error.log, combined.log)
- Timestamp and stack traces
- Error levels: error, warn, info, debug

## 🧪 Testing

Seed database with sample data:
```bash
npm run seed
```

This creates:
- 5 sample hospitals in Kolkata area
- 3 sample pharmacies
- Sample login: `contact@citygeneralhospital.com` / `hospital123`

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use secure JWT_SECRET
3. Configure MongoDB Atlas URI
4. Set allowed origins for CORS
5. Configure email/SMS services

### Recommended Hosts
- **Backend**: Heroku, Railway, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas
- **Environment**: Use platform's secrets manager

### Production Checklist
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] JWT secret changed
- [ ] CORS origins restricted
- [ ] Email/SMS configured
- [ ] Logs directory writable
- [ ] Rate limits configured
- [ ] HTTPS enabled

## 📞 Support

For issues or questions:
- Check logs in `logs/` directory
- Verify MongoDB connection
- Check environment variables
- Review API endpoint documentation

## 📝 License

MIT License - Black Gold Health Platform

---

**Version**: 1.0.0
**Last Updated**: April 2026
