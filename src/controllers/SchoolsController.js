const prisma = require('../../prisma/prismaClient'); // Ensure Prisma client is set up correctly

// List all schools
async function index(req, res) {
  try {
    const schools = await prisma.school.findMany({
      include: {
        students: true,
        teachers: true,
        classes: true,
      },
    });
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schools', error: error.message });
  }
}

// Create a new school
async function create(req, res) {
  try {
    const { name, brand } = req.body;

    if (!name || !brand) {
      return res.status(400).json({ message: 'Name and brand are required' });
    }

    const newSchool = await prisma.school.create({
      data: {
        name,
        brand,
      },
    });

    res.status(201).json({ message: 'School created successfully', school: newSchool });
  } catch (error) {
    res.status(500).json({ message: 'Error creating school', error: error.message });
  }
}

// Update a specific school
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, brand } = req.body;

    if (!name && !brand) {
      return res.status(400).json({ message: 'At least one of name or brand is required for update' });
    }

    const updatedSchool = await prisma.school.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(name && { name }),
        ...(brand && { brand }),
      },
    });

    res.status(200).json({ message: 'School updated successfully', school: updatedSchool });
  } catch (error) {
    res.status(500).json({ message: 'Error updating school', error: error.message });
  }
}

// Delete a specific school
async function destroy(req, res) {
  try {
    const { id } = req.params;

    await prisma.school.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting school', error: error.message });
  }
}

module.exports = {
  index,
  create,
  update,
  destroy,
};
