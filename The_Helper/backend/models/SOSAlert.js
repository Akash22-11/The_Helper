const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  patientInfo: {
    name: String,
    age: Number,
    bloodType: String,
    allergies: [String],
    conditions: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'accepted', 'cancelled', 'resolved'],
    default: 'pending'
  },
  notifiedHospitals: [{
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    notifiedAt: Date,
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    respondedAt: Date,
    eta: Number
  }],
  respondingHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  timeline: [{
    event: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],
  resolvedAt: Date,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
sosAlertSchema.index({ location: '2dsphere' });
sosAlertSchema.index({ status: 1 });
sosAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
