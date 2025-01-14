
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prismaClient'); // Assuming Prisma is configured in the project root
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

// Helper function to generate a unique student ID
function generateStudentId() {
  return 'STU-' + Math.floor(100000 + Math.random() * 900000).toString();
}

// Register a new student
async function signup(req, res) {
  try {
      const { name, email, password, parentContactInfo } = req.body; // Ensure this is included

      // Validate the presence of parentContactInfo
      if (!parentContactInfo) {
          return res.status(400).json({ message: 'Parent contact information is required' });
      }

      const hashedPassword = await hashPassword(password);
      const studentId = generateStudentId();

      const newStudent = await prisma.student.create({
          data: {
              name,
              email,
              passwordDigest: hashedPassword,
              student_id: studentId,
              parentContactInfo, // Include parentContactInfo
          },
      });

      res.status(201).json({ message: 'Student registered successfully', student: newStudent });
  } catch (error) {
      res.status(500).json({ message: 'Error registering student', error: error.message });
  }
}

// Login for an existing student
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isPasswordValid = await verifyPassword(password, student.passwordDigest);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: student.id, email: student.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}

// Get all students
async function index(req, res) {
  try {
    const students = await prisma.student.findMany();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
}

// Get a single student by ID
async function show(req, res) {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id: parseInt(id, 10) } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
}

// Create a new student (Admin action)
async function create(req, res) {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await hashPassword(password);
    const studentId = generateStudentId();

    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        passwordDigest: hashedPassword,
        student_id: studentId,
      },
    });

    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
}

// Update a student's details
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id, 10) },
      data: { name, email },
    });

    res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
}

// Delete a student
async function destroy(req, res) {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { id: parseInt(id, 10) } });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
}

module.exports = {
  signup,
  login,
  index,
  create,
  update,
  destroy,
  show,
};