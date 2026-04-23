const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const SOSAlert = require('../models/SOSAlert');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const { notifyHospitalSOS } = require('../utils/notifications');
const logger = require('../utils/logger');

/**
 * @route   POST /api/sos/trigger
 * @desc    Trigger emergency SOS alert
 * @access  Private (User)
 */
router.post('/trigger', protect, [
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('longitude').isFloat().withMessage('Valid longitude is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Only users can trigger SOS' });
    }

    const { latitude, longitude, address } = req.body;

    // Get user details
    const user = await User.findById(req.user._id);

    // Find nearby hospitals (within 5km)
    const nearbyHospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 5000 // 5km in meters
        }
      },
      isActive: true,
      'services.emergency': true
    }).limit(10);

    if (nearbyHospitals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No emergency hospitals found within 5km radius' 
      });
    }

    // Create SOS alert
    const sosAlert = await SOSAlert.create({
      user: user._id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address
      },
      patientInfo: {
        name: user.name,
        age: user.dateOfBirth ? Math.floor((Date.now() - user.dateOfBirth) / 31557600000) : null,
        bloodType: user.bloodType,
        allergies: user.medicalInfo?.allergies || [],
        conditions: user.medicalInfo?.conditions || [],
        medications: user.medicalInfo?.medications || [],
        emergencyContact: user.medicalInfo?.emergencyContact
      },
      status: 'active',
      notifiedHospitals: nearbyHospitals.map(h => ({
        hospital: h._id,
        notifiedAt: new Date()
      })),
      timeline: [{
        event: 'SOS Triggered',
        timestamp: new Date(),
        details: { hospitalCount: nearbyHospitals.length }
      }]
    });

    // Add to user's SOS history
    user.sosHistory.push(sosAlert._id);
    await user.save();

    // Notify hospitals via Socket.IO (handled in server.js)
    const io = req.app.get('io');
    nearbyHospitals.forEach(hospital => {
      io.to(`hospital_${hospital._id}`).emit('sos:incoming', {
        alertId: sosAlert._id,
        patient: {
          name: user.name,
          age: sosAlert.patientInfo.age,
          bloodType: user.bloodType,
          allergies: user.medicalInfo?.allergies || [],
          conditions: user.medicalInfo?.conditions || []
        },
        location: {
          coordinates: [latitude, longitude],
          address
        },
        distance: calculateDistance(
          hospital.location.coordinates[1],
          hospital.location.coordinates[0],
          latitude,
          longitude
        )
      });

      // Send email and SMS notifications
      notifyHospitalSOS(hospital, {
        patient: sosAlert.patientInfo,
        location: sosAlert.location
      });

      // Update hospital stats
      hospital.stats.totalAlerts += 1;
      hospital.save();
    });

    logger.info(`SOS Alert ${sosAlert._id} triggered by user ${user._id}`);

    res.status(201).json({
      success: true,
      alert: {
        id: sosAlert._id,
        status: sosAlert.status,
        location: sosAlert.location,
        notifiedHospitals: nearbyHospitals.map(h => ({
          id: h._id,
          name: h.name,
          distance: calculateDistance(
            h.location.coordinates[1],
            h.location.coordinates[0],
            latitude,
            longitude
          )
        }))
      }
    });
  } catch (error) {
    logger.error(`SOS Trigger Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sos/:id/status
 * @desc    Get SOS alert status
 * @access  Private
 */
router.get('/:id/status', protect, async (req, res) => {
  try {
    const sosAlert = await SOSAlert.findById(req.params.id)
      .populate('respondingHospital', 'name phone location')
      .populate('notifiedHospitals.hospital', 'name phone');

    if (!sosAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({
      success: true,
      alert: {
        id: sosAlert._id,
        status: sosAlert.status,
        location: sosAlert.location,
        respondingHospital: sosAlert.respondingHospital,
        notifiedHospitals: sosAlert.notifiedHospitals,
        timeline: sosAlert.timeline,
        createdAt: sosAlert.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/sos/:id/cancel
 * @desc    Cancel SOS alert
 * @access  Private (User)
 */
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const sosAlert = await SOSAlert.findById(req.params.id);

    if (!sosAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (!req.user || sosAlert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    sosAlert.status = 'cancelled';
    sosAlert.cancelledAt = new Date();
    sosAlert.timeline.push({
      event: 'Alert Cancelled',
      timestamp: new Date()
    });

    await sosAlert.save();

    // Notify all hospitals
    const io = req.app.get('io');
    sosAlert.notifiedHospitals.forEach(({ hospital }) => {
      io.to(`hospital_${hospital}`).emit('sos:cancelled', {
        alertId: sosAlert._id
      });
    });

    logger.info(`SOS Alert ${sosAlert._id} cancelled`);

    res.json({
      success: true,
      message: 'Alert cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/sos/:id/resolve
 * @desc    Mark SOS as resolved
 * @access  Private (User)
 */
router.post('/:id/resolve', protect, async (req, res) => {
  try {
    const sosAlert = await SOSAlert.findById(req.params.id);

    if (!sosAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (!req.user || sosAlert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    sosAlert.status = 'resolved';
    sosAlert.resolvedAt = new Date();
    sosAlert.timeline.push({
      event: 'Alert Resolved',
      timestamp: new Date()
    });

    await sosAlert.save();

    logger.info(`SOS Alert ${sosAlert._id} resolved`);

    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/sos/:id/hospital/accept
 * @desc    Hospital accepts SOS alert
 * @access  Private (Hospital)
 */
router.post('/:id/hospital/accept', protect, async (req, res) => {
  try {
    if (!req.hospital) {
      return res.status(403).json({ success: false, message: 'Only hospitals can accept alerts' });
    }

    const { eta } = req.body;
    const sosAlert = await SOSAlert.findById(req.params.id).populate('user');

    if (!sosAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Check if hospital was notified
    const hospitalNotification = sosAlert.notifiedHospitals.find(
      n => n.hospital.toString() === req.hospital._id.toString()
    );

    if (!hospitalNotification) {
      return res.status(403).json({ success: false, message: 'Hospital not notified of this alert' });
    }

    // Update notification
    hospitalNotification.response = 'accepted';
    hospitalNotification.respondedAt = new Date();
    hospitalNotification.eta = eta;

    sosAlert.respondingHospital = req.hospital._id;
    sosAlert.status = 'accepted';
    sosAlert.timeline.push({
      event: 'Hospital Accepted',
      timestamp: new Date(),
      details: { hospital: req.hospital.name, eta }
    });

    await sosAlert.save();

    // Update hospital stats
    const hospital = await Hospital.findById(req.hospital._id);
    hospital.stats.acceptedAlerts += 1;
    await hospital.save();

    // Notify patient
    const io = req.app.get('io');
    io.to(`user_${sosAlert.user._id}`).emit('sos:hospital_responding', {
      alertId: sosAlert._id,
      hospital: {
        id: req.hospital._id,
        name: req.hospital.name,
        phone: req.hospital.phone
      },
      eta
    });

    logger.info(`Hospital ${req.hospital._id} accepted SOS ${sosAlert._id}`);

    res.json({
      success: true,
      message: 'Alert accepted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/sos/:id/hospital/decline
 * @desc    Hospital declines SOS alert
 * @access  Private (Hospital)
 */
router.post('/:id/hospital/decline', protect, async (req, res) => {
  try {
    if (!req.hospital) {
      return res.status(403).json({ success: false, message: 'Only hospitals can decline alerts' });
    }

    const sosAlert = await SOSAlert.findById(req.params.id);

    if (!sosAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Update notification
    const hospitalNotification = sosAlert.notifiedHospitals.find(
      n => n.hospital.toString() === req.hospital._id.toString()
    );

    if (hospitalNotification) {
      hospitalNotification.response = 'declined';
      hospitalNotification.respondedAt = new Date();
    }

    sosAlert.timeline.push({
      event: 'Hospital Declined',
      timestamp: new Date(),
      details: { hospital: req.hospital.name }
    });

    await sosAlert.save();

    logger.info(`Hospital ${req.hospital._id} declined SOS ${sosAlert._id}`);

    res.json({
      success: true,
      message: 'Alert declined'
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
