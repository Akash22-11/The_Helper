const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');

/**
 * @route   GET /api/pharmacies/nearby
 * @desc    Find nearby pharmacies
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      maxDistance = 10000,
      is24Hours,
      homeDelivery,
      homeopathy
    } = req.query;

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
    if (is24Hours === 'true') query['services.is24Hours'] = true;
    if (homeDelivery === 'true') query['services.homeDelivery'] = true;
    if (homeopathy === 'true') query['services.homeopathy'] = true;

    const pharmacies = await Pharmacy.find(query).limit(20);

    const pharmaciesWithDistance = pharmacies.map(pharmacy => ({
      id: pharmacy._id,
      name: pharmacy.name,
      location: pharmacy.location,
      phone: pharmacy.phone,
      services: pharmacy.services,
      rating: pharmacy.rating,
      openingHours: pharmacy.openingHours,
      distance: calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        pharmacy.location.coordinates[1],
        pharmacy.location.coordinates[0]
      )
    }));

    res.json({
      success: true,
      count: pharmaciesWithDistance.length,
      pharmacies: pharmaciesWithDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/pharmacies/:id
 * @desc    Get pharmacy details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    res.json({
      success: true,
      pharmacy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Calculate distance between two coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
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
