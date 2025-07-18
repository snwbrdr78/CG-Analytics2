const { User } = require('../models');

async function manageUserRoles() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node manageUserRoles.js <email> <role>');
    console.log('\nAvailable roles:');
    console.log('  - super_admin: Full system control');
    console.log('  - admin: Admin panel access, user management');
    console.log('  - editor: Edit content');
    console.log('  - analyst: View-only access');
    console.log('  - api_user: API access only');
    process.exit(1);
  }

  const [email, role] = args;
  const validRoles = ['super_admin', 'admin', 'editor', 'analyst', 'api_user'];

  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.log(`Valid roles: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  try {
    // Connect to database
    await require('../models').sequelize.authenticate();
    console.log('✅ Database connected');

    // Find the user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Update role
    const oldRole = user.role;
    await user.update({ role });
    
    console.log('✅ User role updated successfully');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Old Role: ${oldRole}`);
    console.log(`   New Role: ${user.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

manageUserRoles();