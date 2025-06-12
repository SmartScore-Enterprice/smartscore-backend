const prisma = require('../../prisma/prismaClient');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Email transporter setup
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
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

  // Send email notification
  async sendEmail(student, message, subject) {
    try {
      if (!student.parentContactInfo?.email) {
        console.log('No parent email found for student:', student.name);
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@smartscore.com',
        to: student.parentContactInfo.email,
        subject: `${subject} - ${student.school.name}`,
        html: this.generateEmailTemplate(student, message, subject),
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent to ${student.parentContactInfo.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  // Send SMS notification (placeholder - integrate with SMS service)
  async sendSMS(student, message) {
    try {
      if (!student.parentContactInfo?.phone) {
        console.log('No parent phone found for student:', student.name);
        return;
      }

      // Integrate with SMS service (Twilio, etc.)
      console.log(`SMS would be sent to ${student.parentContactInfo.phone}: ${message}`);
      
      // Example Twilio integration:
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE,
      //   to: student.parentContactInfo.phone
      // });
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  // Generate email template
  generateEmailTemplate(student, message, subject) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${subject}</h2>
          <p>${student.school.name}</p>
        </div>
        <div class="content">
          <p>Dear Parent/Guardian,</p>
          <p><strong>Student:</strong> ${student.name}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p>Please log into the SmartScore portal for more details.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from SmartScore</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new NotificationService();