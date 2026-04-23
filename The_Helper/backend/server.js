require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// SOS specific rate limiting
const sosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.MAX_SOS_PER_15MIN) || 10,
  message: 'Too many SOS requests from this IP, please try again later'
});
app.use('/api/sos/trigger', sosLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/user', require('./routes/user'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/pharmacies', require('./routes/pharmacies'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Black Gold Health API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Black Gold Health API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      sos: '/api/sos',
      user: '/api/user',
      hospitals: '/api/hospitals',
      pharmacies: '/api/pharmacies'
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // User/Hospital authentication via Socket.IO
  socket.on('authenticate', async (data) => {
    try {
      const { token, type } = data;
      
      if (!token || !type) {
        socket.emit('auth_error', { message: 'Token and type required' });
        return;
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== type) {
        socket.emit('auth_error', { message: 'Invalid token type' });
        return;
      }

      // Join appropriate room
      if (type === 'user') {
        socket.join(`user_${decoded.id}`);
        socket.userId = decoded.id;
        logger.info(`User ${decoded.id} authenticated and joined room`);
      } else if (type === 'hospital') {
        socket.join(`hospital_${decoded.id}`);
        socket.hospitalId = decoded.id;
        logger.info(`Hospital ${decoded.id} authenticated and joined room`);
      }

      socket.emit('authenticated', { success: true });
    } catch (error) {
      logger.error(`Socket auth error: ${error.message}`);
      socket.emit('auth_error', { message: 'Invalid token' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });

  // Ping/Pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`\n🚀 Black Gold Health API Server Started`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.IO: Ready`);
  console.log(`\n💡 Frontend should connect to: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
