// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer"

  console.log('Auth check - Token present:', !!token);

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access denied. No token provided.' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token.' 
      });
    }

    req.user = decoded; // Attach decoded user data to request object
    console.log('Auth successful for user:', decoded.email);
    next(); // Proceed to next middleware or route handler
  });
}

module.exports = authenticateToken;
