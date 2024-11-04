const prisma = require('../../prisma/prismaClient'); // Ensure Prisma client is correctly set up

// List all scores for a student
async function index(req, res) {
  try {
    const { student_id } = req.params;

    const scores = await prisma.score.findMany({
      where: { student_id: parseInt(student_id, 10) },
      include: {
        class: true, // Include class details
      },
    });

    res.status(200).json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ message: 'Error fetching scores', error: error.message });
  }
}

// Add or update a student's score
async function create(req, res) {
  try {
    const { student_id, class_id, ca_score, exam_score, remarks } = req.body;

    if (!student_id || !class_id) {
      return res.status(400).json({ message: 'Student ID and Class ID are required' });
    }

    const final_score = ca_score + exam_score;

    const existingScore = await prisma.score.findFirst({
      where: { student_id: parseInt(student_id, 10), class_id: parseInt(class_id, 10) },
    });

    let score;
    if (existingScore) {
      score = await prisma.score.update({
        where: { id: existingScore.id },
        data: {
          ca_score,
          exam_score,
          final_score,
          remarks,
        },
      });
    } else {
      score = await prisma.score.create({
        data: {
          student_id: parseInt(student_id, 10),
          class_id: parseInt(class_id, 10),
          ca_score,
          exam_score,
          final_score,
          remarks,
        },
      });
    }

    res.status(201).json({ message: 'Score saved successfully', score });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ message: 'Error saving score', error: error.message });
  }
}

// Calculate and return the average score for a student
async function average(req, res) {
  try {
    const { student_id } = req.params;

    const scores = await prisma.score.findMany({
      where: { student_id: parseInt(student_id, 10) },
    });

    if (scores.length === 0) {
      return res.status(404).json({ message: 'No scores found for this student' });
    }

    const totalScore = scores.reduce((sum, score) => sum + score.final_score, 0);
    const averageScore = totalScore / scores.length;

    res.status(200).json({ averageScore });
  } catch (error) {
    console.error('Error calculating average score:', error);
    res.status(500).json({ message: 'Error calculating average score', error: error.message });
  }
}

module.exports = {
  index,
  create,
  average,
};
