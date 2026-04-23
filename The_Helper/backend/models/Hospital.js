const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  services: {
    emergency: { type: Boolean, default: true },
    icu: { type: Boolean, default: false },
    ambulance: { type: Boolean, default: false },
    bloodBank: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false }
  },
  specializations: [String],
  bedAvailability: {
    general: { type: Number, default: 0 },
    icu: { type: Number, default: 0 },
    emergency: { type: Number, default: 0 }
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sosAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOSAlert'
  }],
  stats: {
    totalAlerts: { type: Number, default: 0 },
    acceptedAlerts: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
hospitalSchema.index({ location: '2dsphere' });

// Hash password before saving
hospitalSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
hospitalSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Hospital', hospitalSchema);
