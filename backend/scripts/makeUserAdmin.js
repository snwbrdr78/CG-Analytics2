const { User } = require('../models');

async function makeUserAdmin() {
  try {
    // Connect to database
    await require('../models').sequelize.authenticate();
    console.log('✅ Database connected');

    // Find the admin user
    const adminUser = await User.findOne({
      where: { email: 'info@comedygeni.us' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Update role to admin (which exists in current enum)
    await adminUser.update({ role: 'admin' });
    
    console.log('✅ User role updated to admin');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n📝 Note: The system now supports these roles:');
    console.log('   - super_admin: Full system control');
    console.log('   - admin: Admin panel access, user management');
    console.log('   - editor: Edit content');
    console.log('   - analyst: View-only access');
    console.log('   - api_user: API access only');
    console.log('\n⚠️  Database enum update required for full role support');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

makeUserAdmin();