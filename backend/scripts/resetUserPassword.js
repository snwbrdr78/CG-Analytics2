require('dotenv').config({ path: '../.env' });
const { User } = require('../models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resetPassword() {
  try {
    const email = await question('Enter email address: ');
    const newPassword = await question('Enter new password: ');
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      rl.close();
      process.exit(1);
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    console.log('✅ Password updated successfully for:', email);
    console.log('   User can now login with the new password');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
}

console.log('🔐 Password Reset Tool');
console.log('This will reset a user\'s password in the database\n');
resetPassword();