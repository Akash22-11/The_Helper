const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  phone: String,
  email: String,
  services: {
    is24Hours: { type: Boolean, default: false },
    homeDelivery: { type: Boolean, default: false },
    onlineOrdering: { type: Boolean, default: false },
    homeopathy: { type: Boolean, default: false },
    vaccination: { type: Boolean, default: false },
    labTests: { type: Boolean, default: false }
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
pharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
