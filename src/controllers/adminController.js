const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const prisma = require('../../prisma/prismaClient');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

async function registerAdmin(req, res) {
  console.log('Registration request received:', req.body);
  try {
    const { firstName, lastName, email, password, role, phone, schoolName, schoolAddress } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: firstName, lastName, email, password, role' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if email already exists (mock check for now)
    // In production, uncomment the database check below
    // try {
    //   const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    //   if (existingAdmin) {
    //     return res.status(409).json({ 
    //       success: false,
    //       error: 'An account with this email already exists' 
    //     });
    //   }
    // } catch (dbError) {
    //   console.warn('Database check failed, proceeding with registration:', dbError.message);
    // }

    const fullName = `${firstName} ${lastName}`;
    
    try {
      // Temporarily bypass database for testing
      // In production, uncomment the database code below
      // const hashedPassword = await hashPassword(password);
      // const newAdmin = await prisma.admin.create({
      //   data: {
      //     name: fullName,
      //     email,
      //     passwordDigest: hashedPassword,
      //     phone: phone || null,
      //     schoolName: schoolName || null,
      //     schoolAddress: schoolAddress || null,
      //   },
      // });

      // Generate JWT tokens
      const userId = Date.now(); // Use timestamp as mock ID
      const token = jwt.sign(
        { 
          id: userId, 
          email, 
          role: role,
          name: fullName 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { 
          id: userId, 
          email 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Return response in the format expected by frontend
      return res.status(201).json({ 
        success: true,
        data: {
          user: {
            id: userId,
            firstName,
            lastName,
            email,
            role,
            phone: phone || null,
            schoolName: schoolName || null,
            schoolAddress: schoolAddress || null,
            permissions: role === 'admin' ? ['all'] : ['read'],
            createdAt: new Date().toISOString()
          },
          token,
          refreshToken
        },
        message: 'Registration successful'
      });

    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Database error. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    });
  }
}

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // For testing, return mock login response
    // In production, uncomment the database code below
    
    try {
      // const admin = await prisma.admin.findUnique({ where: { email } });
      // if (!admin) {
      //   return res.status(404).json({ 
      //     success: false,
      //     error: 'Account not found' 
      //   });
      // }

      // const isPasswordValid = await verifyPassword(password, admin.passwordDigest);
      // if (!isPasswordValid) {
      //   return res.status(401).json({ 
      //     success: false,
      //     error: 'Invalid credentials' 
      //   });
      // }

      // Mock successful login
      const userId = 1;
      const token = jwt.sign(
        { 
          id: userId, 
          email, 
          role: 'admin',
          name: 'Test Admin' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { 
          id: userId, 
          email 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      return res.status(200).json({ 
        success: true,
        data: {
          user: {
            id: userId,
            firstName: 'Test',
            lastName: 'Admin',
            email,
            role: 'admin',
            permissions: ['all'],
            createdAt: new Date().toISOString()
          },
          token,
          refreshToken
        },
        message: 'Login successful'
      });

    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Database error. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    });
  }
}

// Get current user data
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // For testing, return mock user data
    // In production, uncomment the database code below
    
    try {
      // const user = await prisma.admin.findUnique({ 
      //   where: { id: userId },
      //   select: {
      //     id: true,
      //     name: true,
      //     email: true,
      //     phone: true,
      //     schoolName: true,
      //     schoolAddress: true,
      //     createdAt: true
      //   }
      // });

      // if (!user) {
      //   return res.status(404).json({ 
      //     success: false,
      //     error: 'User not found' 
      //   });
      // }

      // Mock user data for testing
      const mockUser = {
        id: userId,
        firstName: req.user.name ? req.user.name.split(' ')[0] : 'Test',
        lastName: req.user.name ? req.user.name.split(' ').slice(1).join(' ') : 'User',
        email: userEmail,
        role: req.user.role || 'admin',
        phone: null,
        schoolName: null,
        schoolAddress: null,
        permissions: req.user.role === 'admin' ? ['all'] : ['read'],
        createdAt: new Date().toISOString()
      };

      return res.status(200).json({ 
        success: true,
        data: {
          user: mockUser
        },
        message: 'User data retrieved successfully'
      });

    } catch (dbError) {
      console.error('Database error during user fetch:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Database error. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    });
  }
}

// Logout user
async function logoutUser(req, res) {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return res.status(200).json({ 
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    });
  }
}

// Refresh access token
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Refresh token is required' 
      });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid refresh token' 
        });
      }

      // Generate new access token
      const newToken = jwt.sign(
        { 
          id: decoded.id, 
          email: decoded.email, 
          role: 'admin',
          name: 'Test Admin' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      return res.status(200).json({ 
        success: true,
        data: {
          token: newToken
        },
        message: 'Token refreshed successfully'
      });
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  getCurrentUser,
  logoutUser,
  refreshToken,
};
