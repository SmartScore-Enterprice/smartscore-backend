// controllers/adminController.js
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prismaClient');
require('dotenv').config();  // Ensure dotenv is loaded to read environment variables

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';  // Ensure this matches across the app

// Register a new admin
async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await hashPassword(password);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        passwordDigest: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error: error.message });
  }
}

// Login for existing admin
// controllers/adminController.js
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isPasswordValid = await verifyPassword(password, admin.passwordDigest);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include role (admin rights) in the token payload
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' }, // Add role to the payload
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated token:', token);  // Log the token for debugging

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}


module.exports = {
  registerAdmin,
  loginAdmin,
};
