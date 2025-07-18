require('dotenv').config();
const emailService = require('../services/emailService');

async function testEmailConfiguration() {
  console.log('\n📧 Email Configuration Test\n');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('SMTP Host:', process.env.SMTP_HOST || 'Not configured');
  console.log('SMTP Port:', process.env.SMTP_PORT || 'Not configured');
  console.log('SMTP User:', process.env.SMTP_USER || 'Not configured');
  console.log('SMTP Pass:', process.env.SMTP_PASS ? '****** (configured)' : 'Not configured');
  console.log('Email From:', process.env.EMAIL_FROM || 'Not configured');
  console.log('Frontend URL:', process.env.FRONTEND_URL || 'Not configured');
  
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
    console.log('\n❌ Email is not configured!');
    console.log('\nTo configure email:');
    console.log('1. Edit backend/.env file');
    console.log('2. Set SMTP_USER to your Gmail address');
    console.log('3. Set SMTP_PASS to your Gmail app password');
    console.log('\nFor Gmail:');
    console.log('- Go to https://myaccount.google.com/security');
    console.log('- Enable 2-factor authentication');
    console.log('- Go to "App passwords" and generate a new password');
    console.log('- Use that password for SMTP_PASS');
    return;
  }
  
  console.log('\n✅ Email appears to be configured');
  
  // Ask if they want to send a test email
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSend a test email? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question('Enter recipient email: ', async (email) => {
        try {
          console.log('\n📤 Sending test password reset email...');
          await emailService.sendPasswordResetEmail(email, 'test-token-123');
          console.log('✅ Email sent successfully!');
          console.log('\nNote: The reset link will not work - this is just a test');
        } catch (error) {
          console.error('❌ Failed to send email:', error.message);
          if (error.message.includes('Invalid login')) {
            console.log('\nThis usually means:');
            console.log('- Wrong email/password combination');
            console.log('- Need to use an app-specific password for Gmail');
            console.log('- 2-factor authentication is not enabled');
          }
        }
        rl.close();
        process.exit(0);
      });
    } else {
      rl.close();
      process.exit(0);
    }
  });
}

testEmailConfiguration();