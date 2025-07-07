const prisma = require('../../prisma/prismaClient');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Email transporter setup using Brevo SMTP
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.BREVO_SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    // Brevo API configuration for SMS
    this.brevoApiKey = process.env.BREVO_API_KEY;
    this.brevoApiUrl = 'https://api.brevo.com/v3';
  }

  // Send automated alert for new results
  async sendResultAlert(studentId, resultData) {
    try {
      const student = await prisma.student.findUnique({
        where: { studentId },
        include: { school: true, class: true }
      });

      if (!student) throw new Error('Student not found');

      const message = `New result available for ${student.name}. Subject: ${resultData.subject}, Score: ${resultData.finalScore}`;
      
      // Create notification record
      const notification = await this.createNotification(studentId, message, 'RESULT_ALERT');
      
      // Send via multiple channels
      await Promise.all([
        this.sendEmail(student, message, 'New Result Available'),
        this.sendSMS(student, message),
      ]);

      return notification;
    } catch (error) {
      console.error('Error sending result alert:', error);
      throw error;
    }
  }

  // Send CA score notification
  async sendCAScoreAlert(studentId, caData) {
    try {
      const student = await prisma.student.findUnique({
        where: { studentId },
        include: { school: true }
      });

      const message = `CA Score Updated: ${caData.subject} - ${caData.caScore}/${caData.totalCA}`;
      
      const notification = await this.createNotification(studentId, message, 'CA_ALERT');
      
      await Promise.all([
        this.sendEmail(student, message, 'CA Score Update'),
        this.sendSMS(student, message),
      ]);

      return notification;
    } catch (error) {
      console.error('Error sending CA alert:', error);
      throw error;
    }
  }

  // Send custom notification with customization options
  async sendCustomNotification(studentId, message, options = {}) {
    try {
      const {
        channels = ['email', 'sms', 'app'],
        priority = 'normal',
        template = 'default',
        scheduledFor = null
      } = options;

      const notification = await this.createNotification(
        studentId, 
        message, 
        'CUSTOM',
        { priority, template, scheduledFor }
      );

      const student = await prisma.student.findUnique({
        where: { studentId },
        include: { school: true }
      });

      // Send based on selected channels
      const promises = [];
      if (channels.includes('email')) {
        promises.push(this.sendEmail(student, message, 'School Notification'));
      }
      if (channels.includes('sms')) {
        promises.push(this.sendSMS(student, message));
      }

      await Promise.all(promises);
      return notification;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      throw error;
    }
  }

  // Bulk notification sending
  async sendBulkNotification(studentIds, message, options = {}) {
    try {
      const results = [];
      
      for (const studentId of studentIds) {
        try {
          const result = await this.sendCustomNotification(studentId, message, options);
          results.push({ studentId, success: true, notification: result });
        } catch (error) {
          results.push({ studentId, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Create notification record in database
  async createNotification(studentId, message, type, metadata = {}) {
    return await prisma.notification.create({
      data: {
        studentId,
        message,
        type,
        metadata,
        sentAt: new Date(),
        status: 'SENT'
      },
    });
  }

  // Send email notification using Brevo SMTP
  async sendEmail(student, message, subject) {
    try {
      if (!student.parentContactInfo?.email) {
        console.log('No parent email found for student:', student.name);
        return;
      }

      const mailOptions = {
        from: process.env.BREVO_SENDER_EMAIL || 'noreply@smartscore.com',
        to: student.parentContactInfo.email,
        subject: `${subject} - ${student.school.name}`,
        html: this.generateEmailTemplate(student, message, subject),
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent to ${student.parentContactInfo.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send SMS notification using Brevo API
  async sendSMS(student, message) {
    try {
      if (!student.parentContactInfo?.phone) {
        console.log('No parent phone found for student:', student.name);
        return;
      }

      if (!this.brevoApiKey) {
        console.log('Brevo API key not configured, skipping SMS');
        return;
      }

      // Format phone number (ensure it includes country code)
      let phoneNumber = student.parentContactInfo.phone;
      if (!phoneNumber.startsWith('+')) {
        // Assuming default country code if not provided (adjust as needed)
        phoneNumber = `+234${phoneNumber}`; // Nigeria code as example
      }

      const smsData = {
        type: 'transactional',
        unicodeEnabled: false,
        recipient: phoneNumber,
        content: `${student.school.name}: ${message}`,
        sender: process.env.BREVO_SMS_SENDER || 'SmartScore'
      };

      const response = await fetch(`${this.brevoApiUrl}/transactionalSMS/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey,
        },
        body: JSON.stringify(smsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo SMS API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log(`SMS sent to ${phoneNumber}. Message ID: ${result.reference}`);
      
      return result;
    } catch (error) {
      console.error('Error sending SMS via Brevo:', error);
      throw error;
    }
  }

  // Send email using Brevo Transactional Email API (alternative to SMTP)
  async sendEmailViaAPI(student, message, subject, templateId = null) {
    try {
      if (!student.parentContactInfo?.email) {
        console.log('No parent email found for student:', student.name);
        return;
      }

      if (!this.brevoApiKey) {
        throw new Error('Brevo API key not configured');
      }

      const emailData = {
        sender: {
          name: student.school.name,
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@smartscore.com'
        },
        to: [{
          email: student.parentContactInfo.email,
          name: student.parentContactInfo.parentName || 'Parent/Guardian'
        }],
        subject: `${subject} - ${student.school.name}`,
        ...(templateId ? {
          templateId: templateId,
          params: {
            studentName: student.name,
            schoolName: student.school.name,
            message: message,
            parentName: student.parentContactInfo.parentName || 'Parent/Guardian'
          }
        } : {
          htmlContent: this.generateEmailTemplate(student, message, subject)
        })
      };

      const response = await fetch(`${this.brevoApiUrl}/smtp/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo Email API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log(`Email sent via API to ${student.parentContactInfo.email}. Message ID: ${result.messageId}`);
      
      return result;
    } catch (error) {
      console.error('Error sending email via Brevo API:', error);
      throw error;
    }
  }

  // Generate email template
  generateEmailTemplate(student, message, subject) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white; 
          }
          .header { 
            background-color: #4CAF50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
          }
          .content { 
            padding: 30px 20px; 
            line-height: 1.6; 
          }
          .message-box {
            background-color: #f9f9f9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            font-size: 12px; 
            color: #666; 
            background-color: #f8f8f8;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${subject}</h2>
            <p>${student.school.name}</p>
          </div>
          <div class="content">
            <p>Dear Parent/Guardian,</p>
            <p><strong>Student:</strong> ${student.name}</p>
            <p><strong>Student ID:</strong> ${student.studentIdGenerated || student.studentId}</p>
            
            <div class="message-box">
              <strong>Message:</strong> ${message}
            </div>
            
            <p>Please log into the SmartScore portal for more details and comprehensive reports.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Access Portal</a>
            </div>
            
            <p>If you have any questions or concerns, please contact the school administration.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from SmartScore</p>
            <p>Powered by ${student.school.name}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get notification statistics
  async getNotificationStats(schoolId, dateRange = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const stats = await prisma.notification.groupBy({
        by: ['type', 'status'],
        where: {
          student: {
            schoolId: schoolId
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      });

      return {
        dateRange: { startDate, endDate },
        statistics: stats
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;