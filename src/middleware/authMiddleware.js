// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Ensure dotenv is loaded to read environment variables

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';  // Use the same secret for verification

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract token after "Bearer"

  console.log('Received token:', token);  // Log the token for debugging

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);  // Log the error for debugging
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = decoded;  // Attach decoded user data to request object
    next();  // Proceed to next middleware or route handler
  });
}

module.exports = authenticateToken;
