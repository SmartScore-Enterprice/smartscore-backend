const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prismaClient');
const crypto = require('crypto');

class ResultCheckerService {
  // Generate result checker token with trial limits
  async generateResultToken(studentId, classId) {
    try {
      const student = await prisma.student.findUnique({
        where: { studentId: parseInt(studentId) },
        include: { class: true, school: true }
      });

      if (!student || student.classId !== parseInt(classId)) {
        throw new Error('Invalid student ID or class combination');
      }

      // Generate secure token
      const tokenData = {
        studentId: student.studentId,
        classId: student.classId,
        schoolId: student.schoolId,
        tokenType: 'RESULT_CHECKER'
      };

      const token = jwt.sign(tokenData, process.env.JWT_SECRET, { 
        expiresIn: '30d' // 1 month expiration
      });

      // Create or update result checker record
      const resultChecker = await prisma.resultChecker.upsert({
        where: { 
          studentId_classId: {
            studentId: student.studentId,
            classId: student.classId
          }
        },
        update: {
          token,
          trialCount: 0, // Reset trials on new token
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          updatedAt: new Date()
        },
        create: {
          studentId: student.studentId,
          classId: student.classId,
          token,
          trialCount: 0,
          maxTrials: 3,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      return {
        token,
        expiresAt: resultChecker.expiresAt,
        trialsRemaining: resultChecker.maxTrials - resultChecker.trialCount
      };
    } catch (error) {
      console.error('Error generating result token:', error);
      throw error;
    }
  }

  // Verify result checker token with trial limits
  async verifyResultToken(token, studentId, classId) {
    try {
      // First verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.tokenType !== 'RESULT_CHECKER') {
        throw new Error('Invalid token type');
      }

      // Check database record
      const resultChecker = await prisma.resultChecker.findFirst({
        where: {
          studentId: parseInt(studentId),
          classId: parseInt(classId),
          token: token,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!resultChecker) {
        throw new Error('Token not found or expired');
      }

      // Check trial limits
      if (resultChecker.trialCount >= resultChecker.maxTrials) {
        throw new Error('Maximum trial attempts exceeded');
      }

      // Increment trial count
      await prisma.resultChecker.update({
        where: { id: resultChecker.id },
        data: {
          trialCount: resultChecker.trialCount + 1,
          lastAccessedAt: new Date()
        }
      });

      return {
        valid: true,
        studentId: decoded.studentId,
        classId: decoded.classId,
        trialsRemaining: resultChecker.maxTrials - (resultChecker.trialCount + 1)
      };
    } catch (error) {
      // Log failed attempt
      await this.logFailedAttempt(studentId, classId, error.message);
      throw error;
    }
  }

  // Get student results with authentication
  async getStudentResults(studentId, classId, token) {
    try {
      const verification = await this.verifyResultToken(token, studentId, classId);
      
      if (!verification.valid) {
        throw new Error('Invalid token');
      }

      const results = await prisma.score.findMany({
        where: {
          studentId: parseInt(studentId),
          classId: parseInt(classId)
        },
        include: {
          class: {
            include: {
              subject: true,
              teacher: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        results,
        trialsRemaining: verification.trialsRemaining
      };
    } catch (error) {
      console.error('Error getting student results:', error);
      throw error;
    }
  }

  // Log failed authentication attempts
  async logFailedAttempt(studentId, classId, reason) {
    try {
      await prisma.resultCheckerLog.create({
        data: {
          studentId: parseInt(studentId),
          classId: parseInt(classId),
          attemptType: 'FAILED',
          reason,
          ipAddress: '', // Would be populated from request
          attemptedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging failed attempt:', error);
    }
  }

  // Reset token trials (admin function)
  async resetTokenTrials(studentId, classId) {
    try {
      const updated = await prisma.resultChecker.updateMany({
        where: {
          studentId: parseInt(studentId),
          classId: parseInt(classId)
        },
        data: {
          trialCount: 0,
          isActive: true,
          updatedAt: new Date()
        }
      });

      return updated.count > 0;
    } catch (error) {
      console.error('Error resetting token trials:', error);
      throw error;
    }
  }
}

module.exports = new ResultCheckerService();