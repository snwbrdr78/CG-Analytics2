const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter based on environment
    if (process.env.NODE_ENV === 'production' && process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com') {
      // Production email configuration
      // You can use services like SendGrid, AWS SES, etc.
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development: Use console output or ethereal email
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
      
      // For development, also log to console
      this.transporter.sendMail = async (mailOptions) => {
        console.log('📧 Email would be sent:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Reset Link:', mailOptions.text?.match(/http[s]?:\/\/[^\s]+/)?.[0]);
        return { messageId: 'dev-message-id' };
      };
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"CG Analytics" <noreply@cganalytics.com>',
      to: email,
      subject: 'Password Reset Request - CG Analytics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for your CG Analytics account.</p>
          <p>Please click the link below to reset your password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated email from CG Analytics. Please do not reply.</p>
        </div>
      `,
      text: `
        Password Reset Request
        
        You requested to reset your password for your CG Analytics account.
        
        Please visit this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();