require('dotenv').config({ path: '../.env' });
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function debugLogin(email, testPassword) {
  try {
    console.log(`\n🔍 Debugging login for: ${email}`);
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Active: ${user.isActive}`);
    console.log(`   - Created: ${user.createdAt}`);
    console.log(`   - Last Login: ${user.lastLogin || 'Never'}`);
    
    if (!user.isActive) {
      console.log('⚠️  User account is DEACTIVATED');
    }
    
    // Test password if provided
    if (testPassword) {
      console.log('\n🔐 Testing password...');
      const isValid = await user.validatePassword(testPassword);
      console.log(`   Password validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      // Also test with bcrypt directly
      const directTest = await bcrypt.compare(testPassword, user.password);
      console.log(`   Direct bcrypt test: ${directTest ? '✅ VALID' : '❌ INVALID'}`);
      
      // Show password hash info
      console.log(`   Password hash starts with: ${user.password.substring(0, 7)}...`);
      console.log(`   Hash length: ${user.password.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Check specific user
async function main() {
  try {
    await debugLogin('info@comedygeni.us');
    
    console.log('\n📋 Listing all users:');
    const users = await User.findAll({
      attributes: ['id', 'email', 'username', 'role', 'isActive', 'createdAt']
    });
    
    users.forEach(user => {
      console.log(`\n   - ${user.email} (${user.username})`);
      console.log(`     Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Main error:', error);
    process.exit(1);
  }
}

main();