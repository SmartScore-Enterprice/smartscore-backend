/**
 * Student ID Service
 * Handles generation and validation of student IDs
 */

class StudentIdService {
  /**
   * Generate a unique student ID
   * Format: YYYY-NNNN (Year-4digit number)
   * @returns {string} Generated student ID
   */
  static generateStudentId() {
    const currentYear = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
    return `${currentYear}-${randomNumber}`;
  }

  /**
   * Generate a student ID based on school and sequence
   * @param {string} schoolCode - School code (e.g., 'SCH')
   * @param {number} sequence - Sequential number
   * @returns {string} Generated student ID
   */
  static generateStudentIdWithSchool(schoolCode, sequence) {
    const currentYear = new Date().getFullYear();
    const paddedSequence = sequence.toString().padStart(4, '0');
    return `${schoolCode}-${currentYear}-${paddedSequence}`;
  }

  /**
   * Validate student ID format
   * @param {string} studentId - Student ID to validate
   * @returns {boolean} True if valid format
   */
  static isValidStudentId(studentId) {
    // Basic validation for YYYY-NNNN format
    const pattern = /^\d{4}-\d{4}$/;
    return pattern.test(studentId);
  }

  /**
   * Validate student ID with school code format
   * @param {string} studentId - Student ID to validate
   * @returns {boolean} True if valid format
   */
  static isValidStudentIdWithSchool(studentId) {
    // Validation for SCH-YYYY-NNNN format
    const pattern = /^[A-Z]{2,5}-\d{4}-\d{4}$/;
    return pattern.test(studentId);
  }

  /**
   * Extract year from student ID
   * @param {string} studentId - Student ID
   * @returns {number|null} Year or null if invalid
   */
  static extractYear(studentId) {
    if (this.isValidStudentId(studentId)) {
      return parseInt(studentId.split('-')[0]);
    }
    if (this.isValidStudentIdWithSchool(studentId)) {
      return parseInt(studentId.split('-')[1]);
    }
    return null;
  }
}

module.exports = StudentIdService;
