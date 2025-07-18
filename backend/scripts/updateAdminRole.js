const { User } = require('../models');

async function updateAdminRole() {
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

    // Update role to super_admin
    await adminUser.update({ role: 'super_admin' });
    
    console.log('✅ Admin user role updated to super_admin');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Role: ${adminUser.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
    process.exit(1);
  }
}

updateAdminRole();