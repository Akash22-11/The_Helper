const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Hospital = require('../models/Hospital');

/**
 * @route   GET /api/hospitals/nearby
 * @desc    Find nearby hospitals
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000, emergency, icu, ambulance } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isActive: true
    };

    // Apply filters
    if (emergency === 'true') query['services.emergency'] = true;
    if (icu === 'true') query['services.icu'] = true;
    if (ambulance === 'true') query['services.ambulance'] = true;

    const hospitals = await Hospital.find(query).limit(20);

    const hospitalsWithDistance = hospitals.map(hospital => ({
      id: hospital._id,
      name: hospital.name,
      location: hospital.location,
      phone: hospital.phone,
      services: hospital.services,
      specializations: hospital.specializations,
      bedAvailability: hospital.bedAvailability,
      rating: hospital.rating,
      distance: calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        hospital.location.coordinates[1],
        hospital.location.coordinates[0]
      )
    }));

    res.json({
      success: true,
      count: hospitalsWithDistance.length,
      hospitals: hospitalsWithDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/hospitals/:id
 * @desc    Get hospital details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({
      success: true,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        location: hospital.location,
        phone: hospital.phone,
        email: hospital.email,
        services: hospital.services,
        specializations: hospital.specializations,
        bedAvailability: hospital.bedAvailability,
        rating: hospital.rating,
        verified: hospital.verified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/hospitals/dashboard/alerts
 * @desc    Get hospital's SOS alerts
 * @access  Private (Hospital)
 */
router.get('/dashboard/alerts', protect, async (req, res) => {
  try {
    if (!req.hospital) {
      return res.status(403).json({ success: false, message: 'Hospital access only' });
    }

    const SOSAlert = require('../models/SOSAlert');
    
    const alerts = await SOSAlert.find({
      'notifiedHospitals.hospital': req.hospital._id,
      status: { $in: ['active', 'pending'] }
    })
    .populate('user', 'name phone')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/hospitals/profile
 * @desc    Update hospital profile
 * @access  Private (Hospital)
 */
router.put('/profile', protect, async (req, res) => {
  try {
    if (!req.hospital) {
      return res.status(403).json({ success: false, message: 'Hospital access only' });
    }

    const { phone, services, specializations, bedAvailability } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.hospital._id,
      { phone, services, specializations, bedAvailability },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        phone: hospital.phone,
        services: hospital.services,
        specializations: hospital.specializations,
        bedAvailability: hospital.bedAvailability
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
