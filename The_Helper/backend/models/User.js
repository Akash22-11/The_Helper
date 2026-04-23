const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
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
  dateOfBirth: {
    type: Date
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']
  },
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
    water: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    lastUpdated: Date
  },
  sosHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOSAlert'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
