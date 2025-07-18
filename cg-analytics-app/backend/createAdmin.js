const { User } = require('./models');

async function createAdminUser() {
  try {
    // Delete existing admin user if exists
    await User.destroy({ where: { email: 'admin@cg.com' } });
    
    // Create new admin user with plain password - the model will hash it
    const user = await User.create({
      username: 'cgadmin',
      email: 'admin@cg.com',
      password: 'password123', // Plain password - will be hashed by the model
      role: 'admin',
      isActive: true
    });
    
    console.log('Admin user created successfully');
    console.log('Email: admin@cg.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();