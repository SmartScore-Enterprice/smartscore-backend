// src/controllers/TeachersController.js

const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prismaClient');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

// Teacher Sign-Up
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        passwordDigest: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Teacher registered successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Error registering teacher', error: error.message });
  }
}

// Teacher Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const isPasswordValid = await verifyPassword(password, teacher.passwordDigest);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: teacher.id, email: teacher.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}

// Other CRUD methods
async function index(req, res) {
  try {
    const teachers = await prisma.teacher.findMany();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
}

async function show(req, res) {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({ where: { id: parseInt(id, 10) } });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher', error: error.message });
  }
}

async function create(req, res) {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const newTeacher = await prisma.teacher.create({
      data: { name, email, passwordDigest: hashedPassword },
    });

    res.status(201).json({ message: 'Teacher created successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Error creating teacher', error: error.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id, 10) },
      data: { name, email, passwordDigest: hashedPassword },
    });

    res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher', error: error.message });
  }
}

async function destroy(req, res) {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: parseInt(id, 10) } });
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error: error.message });
  }
}

module.exports = { signup, login, index, show, create, update, destroy };
