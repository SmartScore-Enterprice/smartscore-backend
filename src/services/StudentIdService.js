const prisma = require('../../prisma/prismaClient');

class StudentIdService {
  // Generate school-specific student ID
  async generateStudentId(schoolId) {
    try {
      const school = await prisma.school.findUnique({
        where: { id: parseInt(schoolId) }
      });

      if (!school) {
        throw new Error('School not found');
      }

      // Extract school initials
      const schoolInitials = this.extractInitials(school.name);
      
      // Get next sequential number for this school
      const sequentialNumber = await this.getNextSequentialNumber(schoolId);
      
      // Format: SCHOOLINITIALS + YEAR + SEQUENTIAL (e.g., ABC202400001)
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const paddedNumber = sequentialNumber.toString().padStart(5, '0');
      
      const studentId = `${schoolInitials}${currentYear}${paddedNumber}`;
      
      // Ensure uniqueness (double-check)
      const exists = await this.checkStudentIdExists(studentId);
      if (exists) {
        // If by any chance it exists, try next number
        return await this.generateStudentId(schoolId);
      }
      
      return studentId;
    } catch (error) {
      console.error('Error generating student ID:', error);
      throw error;
    }
  }

  // Extract initials from school name
  extractInitials(schoolName) {
    return schoolName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3); // Take first 3 initials max
  }

  // Get next sequential number for school
  async getNextSequentialNumber(schoolId) {
    try {
      // Get the highest student ID for this school in current year
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const school = await prisma.school.findUnique({
        where: { id: parseInt(schoolId) }
      });
      
      const schoolInitials = this.extractInitials(school.name);
      const pattern = `${schoolInitials}${currentYear}%`;
      
      const lastStudent = await prisma.student.findFirst({
        where: {
          schoolId: parseInt(schoolId),
          studentIdGenerated: {
            like: pattern
          }
        },
        orderBy: {
          studentIdGenerated: 'desc'
        }
      });

      if (!lastStudent || !lastStudent.studentIdGenerated) {
        return 1; // First student for this school/year
      }

      // Extract sequential number from last student ID
      const lastId = lastStudent.studentIdGenerated;
      const sequentialPart = lastId.slice(-5); // Last 5 digits
      const lastNumber = parseInt(sequentialPart, 10);
      
      return lastNumber + 1;
    } catch (error) {
      console.error('Error getting sequential number:', error);
      return 1; // Default to 1 if error
    }
  }

  // Check if student ID already exists
  async checkStudentIdExists(studentId) {
    try {
      const existing = await prisma.student.findFirst({
        where: {
          studentIdGenerated: studentId
        }
      });
      
      return !!existing;
    } catch (error) {
      console.error('Error checking student ID existence:', error);
      return false;
    }
  }

  // Validate student ID format
  validateStudentIdFormat(studentId) {
    // Format: ABC20001 (3 letters + 2 digit year + 5 digit number)
    const pattern = /^[A-Z]{2,3}\d{7}$/;
    return pattern.test(studentId);
  }

  // Get student ID info
  async getStudentIdInfo(studentId) {
    try {
      if (!this.validateStudentIdFormat(studentId)) {
        throw new Error('Invalid student ID format');
      }

      const schoolInitials = studentId.slice(0, 3).replace(/\d/g, '');
      const yearPart = studentId.slice(schoolInitials.length, schoolInitials.length + 2);
      const sequentialPart = studentId.slice(schoolInitials.length + 2);

      return {
        schoolInitials,
        year: `20${yearPart}`,
        sequentialNumber: parseInt(sequentialPart, 10),
        fullId: studentId
      };
    } catch (error) {
      console.error('Error parsing student ID:', error);
      throw error;
    }
  }
}

module.exports = new StudentIdService();