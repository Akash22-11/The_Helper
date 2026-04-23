const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user or hospital
    if (decoded.type === 'user') {
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
    } else if (decoded.type === 'hospital') {
      req.hospital = await Hospital.findById(decoded.id);
      if (!req.hospital) {
        return res.status(401).json({ 
          success: false, 
          message: 'Hospital not found' 
        });
      }
    }

    req.userType = decoded.type;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Generate JWT token
 */
const generateToken = (id, type) => {
  return jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = { protect, generateToken };
