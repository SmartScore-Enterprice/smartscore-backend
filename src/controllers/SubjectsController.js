const prisma = require('../../prisma/prismaClient'); // Ensure Prisma client is set up correctly

// List all subjects
async function index(req, res) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        classes: true, // Include classes associated with the subject
        teachers: true, // Include teachers associated with the subject
      },
    });
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
}

// Create a new subject
async function create(req, res) {
  try {
    const { name, code, class_id } = req.body;

    if (!name || !class_id) {
      return res.status(400).json({ message: 'Name and class_id are required' });
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        class_id: parseInt(class_id, 10), // Ensure class_id is an integer
      },
    });

    res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
}

// Update a specific subject
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, code, class_id } = req.body;

    if (!name && !code && !class_id) {
      return res.status(400).json({ message: 'At least one of name, code, or class_id is required for update' });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(class_id && { class_id: parseInt(class_id, 10) }), // Ensure class_id is an integer
      },
    });

    res.status(200).json({ message: 'Subject updated successfully', subject: updatedSubject });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Error updating subject', error: error.message });
  }
}

// Show details of a specific subject
async function show(req, res) {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        classes: true, // Include classes associated with the subject
        teachers: true, // Include teachers associated with the subject
      },
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Error fetching subject', error: error.message });
  }
}

// Delete a specific subject
async function destroy(req, res) {
  try {
    const { id } = req.params;

    await prisma.subject.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Error deleting subject', error: error.message });
  }
}

module.exports = {
  index,
  create,
  update,
  show,
  destroy,
};
