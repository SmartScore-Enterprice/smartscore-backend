/**
 * Result Checker Service
 * Handles result checking and validation functionality
 */

const prisma = require('../../prisma/prismaClient');

class ResultCheckerService {
  /**
   * Check if student results are available
   * @param {string} studentId - Student ID
   * @param {string} examType - Type of exam (e.g., 'midterm', 'final')
   * @returns {Object} Result availability status
   */
  static async checkResultAvailability(studentId, examType) {
    try {
      const student = await prisma.student.findFirst({
        where: { studentIdGenerated: studentId }
      });

      if (!student) {
        return {
          available: false,
          message: 'Student not found'
        };
      }

      const scores = await prisma.score.findMany({
        where: {
          studentId: student.studentId,
          examType: examType
        },
        include: {
          subject: true
        }
      });

      return {
        available: scores.length > 0,
        message: scores.length > 0 ? 'Results available' : 'Results not yet published',
        resultCount: scores.length
      };
    } catch (error) {
      console.error('Error checking result availability:', error);
      throw new Error('Failed to check result availability');
    }
  }

  /**
   * Get student results
   * @param {string} studentId - Student ID
   * @param {string} examType - Type of exam
   * @returns {Object} Student results
   */
  static async getStudentResults(studentId, examType) {
    try {
      const student = await prisma.student.findFirst({
        where: { studentIdGenerated: studentId }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      const scores = await prisma.score.findMany({
        where: {
          studentId: student.studentId,
          examType: examType
        },
        include: {
          subject: true,
          student: {
            select: {
              name: true,
              studentIdGenerated: true
            }
          }
        }
      });

      // Calculate total and average
      const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
      const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

      return {
        student: {
          name: student.name,
          studentId: student.studentIdGenerated
        },
        examType: examType,
        subjects: scores.map(score => ({
          subject: score.subject.name,
          score: score.score,
          grade: this.calculateGrade(score.score)
        })),
        summary: {
          totalSubjects: scores.length,
          totalScore: totalScore,
          averageScore: Math.round(averageScore * 100) / 100,
          overallGrade: this.calculateGrade(averageScore)
        }
      };
    } catch (error) {
      console.error('Error getting student results:', error);
      throw new Error('Failed to retrieve student results');
    }
  }

  /**
   * Calculate grade based on score
   * @param {number} score - Numeric score
   * @returns {string} Letter grade
   */
  static calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Validate student credentials for result checking
   * @param {string} studentId - Student ID
   * @param {string} dob - Date of birth (optional)
   * @returns {boolean} True if valid
   */
  static async validateStudentCredentials(studentId, dob = null) {
    try {
      const student = await prisma.student.findFirst({
        where: { studentIdGenerated: studentId }
      });

      if (!student) {
        return false;
      }

      // If date of birth is provided, validate it
      if (dob) {
        // Add date of birth validation logic here if needed
        // This would require adding DOB field to student model
      }

      return true;
    } catch (error) {
      console.error('Error validating student credentials:', error);
      return false;
    }
  }
}

module.exports = ResultCheckerService;
