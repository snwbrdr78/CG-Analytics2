require('dotenv').config();
const { User } = require('../models');

async function setPassword() {
  try {
    const email = 'info@comedygeni.us';
    const newPassword = 'CGAdmin2025!';
    
    console.log(`\n🔐 Resetting password for: ${email}`);
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    console.log('✅ Password updated successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log('\n⚠️  Please change this password after logging in for security.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setPassword();