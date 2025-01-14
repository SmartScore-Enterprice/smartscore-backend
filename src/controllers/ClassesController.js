// src/controllers/ClassesController.js

const prisma = require('../../prisma/prismaClient'); // Adjust the path if needed

const ClassesController = {
  index: async (req, res) => {
    try {
      const classes = await prisma.class.findMany({
        include: {
          school: true,
          subject: true,
          teacher: true,
        },
      });
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving classes', error });
    }
  },

  create: async (req, res) => {
    const { name, subject_id, teacher_id, school_id } = req.body;
    try {
      const newClass = await prisma.class.create({
        data: {
          name,
          subject: {
            connect: { id: subject_id },
          },
          teacher: {
            connect: { id: teacher_id },
          },
          school: {
            connect: { id: school_id },
          },
        },
      });
      res.status(201).json(newClass);
    } catch (error) {
      res.status(400).json({ message: 'Error creating class', error });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { name, subject_id, teacher_id, school_id } = req.body;
    try {
      const updatedClass = await prisma.class.update({
        where: { id: parseInt(id) },
        data: {
          name,
          subject: {
            connect: { id: subject_id },
          },
          teacher: {
            connect: { id: teacher_id },
          },
          school: {
            connect: { id: school_id },
          },
        },
      });
      res.json(updatedClass);
    } catch (error) {
      res.status(400).json({ message: 'Error updating class', error });
    }
  },

  show: async (req, res) => {
    const { id } = req.params;
    try {
      const classDetail = await prisma.class.findUnique({
        where: { id: parseInt(id) },
        include: {
          school: true,
          subject: true,
          teacher: true,
        },
      });
      if (!classDetail) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.json(classDetail);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving class details', error });
    }
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.class.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ message: 'Error deleting class', error });
    }
  },
};

module.exports = ClassesController; // Make sure this export is correct
