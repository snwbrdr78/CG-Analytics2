const { User, sequelize } = require('../models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync models
    await sequelize.sync();
    
    console.log('\n🔐 Create Admin User');
    console.log('─'.repeat(30));
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    
    // Check if user exists
    const existingUser = await User.findOne({
      where: { 
        [require('sequelize').Op.or]: [{ email }, { username }] 
      }
    });
    
    if (existingUser) {
      console.log('\n❌ User with this email or username already exists');
      process.exit(1);
    }
    
    // Create admin user
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();