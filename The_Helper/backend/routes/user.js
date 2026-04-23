const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'User access only' });
    }

    const user = await User.findById(req.user._id).populate('sosHistory');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        bloodType: user.bloodType,
        medicalInfo: user.medicalInfo,
        prescriptions: user.prescriptions,
        wellnessTracking: user.wellnessTracking,
        sosHistory: user.sosHistory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'User access only' });
    }

    const { name, phone, dateOfBirth, bloodType, medicalInfo } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, dateOfBirth, bloodType, medicalInfo },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        bloodType: user.bloodType,
        medicalInfo: user.medicalInfo
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/user/prescriptions
 * @desc    Add prescription
 * @access  Private
 */
router.post('/prescriptions', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'User access only' });
    }

    const { name, dosage, frequency, startDate, endDate, reminderTime, imageUrl } = req.body;

    const user = await User.findById(req.user._id);
    user.prescriptions.push({
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      reminderTime,
      imageUrl
    });

    await user.save();

    res.status(201).json({
      success: true,
      prescriptions: user.prescriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/user/prescriptions/:id
 * @desc    Update prescription
 * @access  Private
 */
router.put('/prescriptions/:id', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'User access only' });
    }

    const user = await User.findById(req.user._id);
    const prescription = user.prescriptions.id(req.params.id);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    Object.assign(prescription, req.body);
    await user.save();

    res.json({
      success: true,
      prescriptions: user.prescriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/user/prescriptions/:id
 * @desc    Delete prescription
 * @access  Private
 */
router.delete('/prescriptions/:id', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'User access only' });
    }

    const user = await User.findById(req.user._id);
    user.prescriptions.pull(req.params.id);
    await user.save();

    res.json({
      success: true,
      prescriptions: user.prescriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/user/wellness
 * @desc    Update wellness tracking
 * @access  Private
 */
router.put('/wellness', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'User access only' });
    }

    const { water, steps, sleep, calories } = req.body;

    const user = await User.findById(req.user._id);
    user.wellnessTracking = {
      water: water !== undefined ? water : user.wellnessTracking.water,
      steps: steps !== undefined ? steps : user.wellnessTracking.steps,
      sleep: sleep !== undefined ? sleep : user.wellnessTracking.sleep,
      calories: calories !== undefined ? calories : user.wellnessTracking.calories,
      lastUpdated: new Date()
    };

    await user.save();

    res.json({
      success: true,
      wellnessTracking: user.wellnessTracking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
