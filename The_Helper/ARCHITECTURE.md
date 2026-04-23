# 📊 Black Gold Health - Technical Architecture & Summary

## Project Overview

**Black Gold Health** is a complete, production-ready emergency healthcare platform that enables:
- Instant emergency SOS alerts
- Real-time hospital notifications
- Geospatial hospital/pharmacy search
- Prescription management
- Wellness tracking

## Technology Stack Summary

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5/CSS3/JavaScript | Core web technologies |
| Socket.IO Client | Real-time communication |
| Geolocation API | GPS tracking |
| Notification API | Browser notifications |
| Fetch API | HTTP requests |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime environment |
| Express | 4.18+ | Web framework |
| MongoDB | 4.4+ | Database |
| Mongoose | 8.0+ | ODM for MongoDB |
| Socket.IO | 4.6+ | WebSocket server |
| JWT | 9.0+ | Authentication |
| bcryptjs | 2.4+ | Password hashing |
| Winston | 3.11+ | Logging |
| Nodemailer | 6.9+ | Email notifications |
| Twilio | 4.19+ | SMS notifications |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐    │
│  │  Index   │  │   SOS    │  │ Hospital │  │ Pharmacy│    │
│  │  Page    │  │  Active  │  │  Finder  │  │ Finder  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘    │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘         │
│                          │                                   │
│                    Socket.IO + REST API                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      EXPRESS SERVER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SOCKET.IO SERVER                        │   │
│  │  Real-time: SOS alerts, Hospital responses, ETA     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐   │
│  │   Auth   │  │   SOS    │  │   User   │  │Hospital │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │ Routes  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘   │
│       │             │              │              │         │
│  ┌────┴─────────────┴──────────────┴──────────────┴────┐  │
│  │              MIDDLEWARE LAYER                        │  │
│  │  - JWT Authentication                                │  │
│  │  - Rate Limiting                                     │  │
│  │  - Error Handling                                    │  │
│  │  - Input Validation                                  │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────┴──────────────────────────────────┐
│                    MONGODB DATABASE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │    Users    │  │  Hospitals  │  │  SOSAlerts   │       │
│  │ Collection  │  │ Collection  │  │  Collection  │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
│  ┌─────────────┐  ┌─────────────────────────────────┐     │
│  │ Pharmacies  │  │  Geospatial Indexes (2dsphere)  │     │
│  │ Collection  │  │  - Hospital locations           │     │
│  └─────────────┘  │  - Pharmacy locations           │     │
│                   │  - SOS alert locations          │     │
│                   └─────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘

External Services (Optional):
┌──────────┐     ┌──────────┐
│  Twilio  │────▶│   SMS    │
│   API    │     │Notifications│
└──────────┘     └──────────┘

┌──────────┐     ┌──────────┐
│   SMTP   │────▶│  Email   │
│  Server  │     │Notifications│
└──────────┘     └──────────┘
```

## Data Flow: SOS Emergency

```
1. USER TRIGGERS SOS
   ↓
2. Frontend captures GPS location
   ↓
3. POST /api/sos/trigger
   ↓
4. Backend finds hospitals within 5km (MongoDB geospatial query)
   ↓
5. Creates SOSAlert document
   ↓
6. PARALLEL NOTIFICATIONS:
   ├─→ Socket.IO to all nearby hospitals
   ├─→ Email to hospital contacts
   └─→ SMS to hospital contacts
   ↓
7. User sees list of notified hospitals (real-time)
   ↓
8. Hospital receives alert on dashboard
   ↓
9. Hospital clicks "Accept"
   ↓
10. POST /api/sos/:id/hospital/accept
    ↓
11. Backend updates SOSAlert
    ↓
12. Socket.IO notification to user
    ↓
13. User sees hospital response instantly
    ↓
14. User can cancel or mark as resolved
```

## Database Schema Details

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  phone: String,
  password: String (bcrypt hashed),
  dateOfBirth: Date,
  bloodType: String (enum),
  medicalInfo: {
    allergies: [String],
    conditions: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  prescriptions: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    reminderTime: String,
    imageUrl: String
  }],
  wellnessTracking: {
    water: Number,
    steps: Number,
    sleep: Number,
    calories: Number,
    lastUpdated: Date
  },
  sosHistory: [ObjectId] (ref: SOSAlert),
  createdAt: Date
}
```

### Hospital Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  phone: String,
  password: String (bcrypt hashed),
  location: {
    type: "Point",
    coordinates: [Number, Number], // [longitude, latitude]
    address: String
  }, // Indexed: 2dsphere
  services: {
    emergency: Boolean,
    icu: Boolean,
    ambulance: Boolean,
    bloodBank: Boolean,
    pharmacy: Boolean
  },
  specializations: [String],
  bedAvailability: {
    general: Number,
    icu: Number,
    emergency: Number
  },
  rating: Number (0-5),
  verified: Boolean,
  stats: {
    totalAlerts: Number,
    acceptedAlerts: Number,
    averageResponseTime: Number
  },
  createdAt: Date
}
```

### SOSAlert Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  location: {
    type: "Point",
    coordinates: [Number, Number],
    address: String
  }, // Indexed: 2dsphere
  patientInfo: {
    name: String,
    age: Number,
    bloodType: String,
    allergies: [String],
    conditions: [String],
    medications: [String],
    emergencyContact: Object
  },
  status: String (enum: pending, active, accepted, cancelled, resolved),
  notifiedHospitals: [{
    hospital: ObjectId (ref: Hospital),
    notifiedAt: Date,
    response: String (enum: pending, accepted, declined),
    respondedAt: Date,
    eta: Number
  }],
  respondingHospital: ObjectId (ref: Hospital),
  timeline: [{
    event: String,
    timestamp: Date,
    details: Mixed
  }],
  resolvedAt: Date,
  cancelledAt: Date,
  createdAt: Date (indexed, descending)
}
```

## API Endpoints Summary

### Authentication (Public)
- `POST /api/auth/user/register` - Register new user
- `POST /api/auth/user/login` - Login user
- `POST /api/auth/hospital/register` - Register hospital
- `POST /api/auth/hospital/login` - Login hospital

### SOS (Protected)
- `POST /api/sos/trigger` - Trigger emergency (User)
- `GET /api/sos/:id/status` - Get alert status
- `POST /api/sos/:id/cancel` - Cancel alert (User)
- `POST /api/sos/:id/resolve` - Mark resolved (User)
- `POST /api/sos/:id/hospital/accept` - Accept alert (Hospital)
- `POST /api/sos/:id/hospital/decline` - Decline alert (Hospital)

### User Profile (Protected - User)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/prescriptions` - Add prescription
- `PUT /api/user/prescriptions/:id` - Update prescription
- `DELETE /api/user/prescriptions/:id` - Delete prescription
- `PUT /api/user/wellness` - Update wellness tracking

### Hospitals (Public/Protected)
- `GET /api/hospitals/nearby` - Find nearby hospitals (Public)
- `GET /api/hospitals/:id` - Get hospital details (Public)
- `GET /api/hospitals/dashboard/alerts` - Get alerts (Protected - Hospital)
- `PUT /api/hospitals/profile` - Update profile (Protected - Hospital)

### Pharmacies (Public)
- `GET /api/pharmacies/nearby` - Find nearby pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy details

## Security Implementation

### Authentication
- JWT tokens with 30-day expiration
- Tokens stored in localStorage
- Sent in Authorization header: `Bearer <token>`
- User type embedded in token: `{ id, type: 'user'|'hospital' }`

### Password Security
- bcrypt hashing with 10 salt rounds
- Passwords never returned in API responses
- Password field excluded in queries (`select: false`)

### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- SOS trigger: 10 requests per 15 minutes per IP
- Prevents abuse and DOS attacks

### Input Validation
- express-validator for all inputs
- Geospatial coordinates validated
- Email format validation
- Phone number validation
- Strong password requirements (min 6 chars)

### CORS Protection
- Configurable allowed origins
- Credentials enabled for cookies
- Pre-flight request handling

## Socket.IO Implementation

### Connection Flow
```javascript
// Client connects
socket = io('http://localhost:5000');

// Client authenticates
socket.emit('authenticate', {
  token: localStorage.getItem('token'),
  type: 'user' // or 'hospital'
});

// Server validates JWT and joins room
socket.join(`user_${userId}`);
// or
socket.join(`hospital_${hospitalId}`);
```

### Event Types
**User Events:**
- `sos:hospital_responding` - Hospital accepted alert
- `sos:eta_update` - ETA information
- `sos:cancelled` - Alert cancelled

**Hospital Events:**
- `sos:incoming` - New SOS alert received
- `sos:cancelled` - Patient cancelled

## File Structure Details

```
black-gold-health/
├── frontend/                     # 7 HTML pages
│   ├── index.html               # Landing + SOS button
│   ├── sos-active.html          # Active emergency UI
│   ├── hospital-dashboard.html  # Hospital alert dashboard
│   ├── hospital-finder.html     # Search hospitals
│   ├── pharmacy-finder.html     # Search pharmacies
│   ├── prescription-organiser.html # Manage prescriptions
│   └── wellness-tips.html       # Wellness tracking
│
├── backend/
│   ├── models/                  # 4 Mongoose models
│   │   ├── User.js             # User schema + methods
│   │   ├── Hospital.js         # Hospital schema
│   │   ├── SOSAlert.js         # Emergency alert schema
│   │   └── Pharmacy.js         # Pharmacy schema
│   │
│   ├── routes/                  # 5 route files
│   │   ├── auth.js             # 4 endpoints
│   │   ├── sos.js              # 6 endpoints
│   │   ├── user.js             # 5 endpoints
│   │   ├── hospitals.js        # 4 endpoints
│   │   └── pharmacies.js       # 2 endpoints
│   │
│   ├── middleware/              # 2 middleware files
│   │   ├── auth.js             # JWT verification
│   │   └── errorHandler.js     # Global error handler
│   │
│   ├── utils/                   # 2 utility files
│   │   ├── logger.js           # Winston logger
│   │   └── notifications.js    # Email/SMS helpers
│   │
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   │
│   ├── server.js               # Main Express + Socket.IO server
│   ├── seed.js                 # Database seeder
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   └── README.md               # Backend documentation
│
├── README.md                    # Main documentation
├── SETUP_GUIDE.md              # Installation guide
├── ARCHITECTURE.md             # This file
├── start.sh                    # Startup script (Mac/Linux)
├── start.bat                   # Startup script (Windows)
└── verify.sh                   # Verification script
```

## Performance Considerations

### Database Optimization
- Geospatial indexes on all location fields (2dsphere)
- Compound indexes on status + createdAt for SOS queries
- Email uniqueness enforced at database level
- Connection pooling enabled

### API Performance
- Pagination for list endpoints (limit 20-50)
- Select only required fields
- Populate references selectively
- Cache static data where appropriate

### Frontend Optimization
- No build step required (faster development)
- CDN for Socket.IO library
- Lazy loading for images
- GPU-accelerated animations
- Minimal JavaScript bundle

## Deployment Architecture

### Production Setup
```
┌─────────────────┐
│   Netlify/      │
│   Vercel        │◀── Frontend (static HTML/CSS/JS)
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Heroku/       │
│   Railway/      │◀── Backend (Node.js + Express)
│   DigitalOcean  │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   MongoDB       │
│   Atlas         │◀── Database (Cloud)
└─────────────────┘
```

## Monitoring & Logging

### Logs (Winston)
- **error.log** - Error messages only
- **combined.log** - All log levels
- Console output in development
- File output in production

### Log Levels
- `error` - Application errors
- `warn` - Warning messages
- `info` - General information
- `debug` - Detailed debugging

### Key Metrics to Monitor
- SOS trigger count
- Hospital response time
- API response times
- Socket.IO connection count
- Database query performance
- Error rates

## Testing Checklist

### Backend Tests
- [ ] User registration/login
- [ ] Hospital registration/login
- [ ] SOS trigger with GPS
- [ ] Hospital notification
- [ ] Hospital accept/decline
- [ ] Geospatial queries
- [ ] Socket.IO events
- [ ] Rate limiting
- [ ] JWT expiration

### Frontend Tests
- [ ] User registration/login
- [ ] SOS button functionality
- [ ] Geolocation permission
- [ ] Socket.IO connection
- [ ] Real-time updates
- [ ] Hospital finder
- [ ] Pharmacy finder
- [ ] Prescription management
- [ ] Wellness tracking

### Integration Tests
- [ ] End-to-end SOS flow
- [ ] User → Backend → Hospital
- [ ] Real-time notifications
- [ ] Multiple simultaneous SOS
- [ ] Network error handling
- [ ] Browser compatibility

## Scalability Considerations

### Current Limits
- Single server instance
- Single MongoDB instance
- No caching layer
- No CDN for assets

### Scaling Options
1. **Horizontal Scaling**
   - Multiple backend instances
   - Load balancer (nginx)
   - Redis for session storage
   - Socket.IO with Redis adapter

2. **Database Scaling**
   - MongoDB replica set
   - Sharding by geographic region
   - Read replicas

3. **Caching**
   - Redis for frequently accessed data
   - CDN for static assets
   - Browser caching headers

4. **Queue System**
   - RabbitMQ/Redis for background jobs
   - Async notification processing
   - Email/SMS queue

## Future Enhancements

### Planned Features
- [ ] Mobile apps (React Native/Flutter)
- [ ] Video consultation
- [ ] Ambulance GPS tracking
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] AI diagnosis assistant
- [ ] Telemedicine integration
- [ ] Electronic health records
- [ ] Appointment booking
- [ ] Lab test results

### Technical Improvements
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Unit test coverage
- [ ] End-to-end tests
- [ ] Performance monitoring
- [ ] A/B testing framework

## License

MIT License - Free for personal and commercial use

## Credits

Developed by Black Gold Health Team
April 2026

---

**Total Lines of Code:** ~3,500+
**API Endpoints:** 21
**Database Models:** 4
**Frontend Pages:** 7
**Real-time Events:** 5
