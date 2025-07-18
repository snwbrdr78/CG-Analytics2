require('dotenv').config({ path: '../.env' });
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function testPassword() {
  try {
    const email = 'info@comedygeni.us';
    const testPasswords = ['e434', 'password', 'admin', 'Password123'];
    
    console.log(`\n🔍 Testing passwords for: ${email}`);
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\nTesting common passwords:');
    for (const pwd of testPasswords) {
      const isValid = await user.validatePassword(pwd);
      console.log(`   "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    // Set a known password for testing
    console.log('\n🔧 Setting temporary password "TempPass123!" for testing...');
    await user.update({ password: 'TempPass123!' });
    
    // Verify it works
    const testValid = await user.validatePassword('TempPass123!');
    console.log(`   Password set and validation: ${testValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (testValid) {
      console.log('\n✅ Password has been reset to: TempPass123!');
      console.log('   Please change this immediately after logging in!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPassword();