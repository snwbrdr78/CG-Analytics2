require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function createTestToken() {
  try {
    // Find the super admin user
    const user = await User.findOne({
      where: { email: 'info@comedygeni.us' }
    });
    
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Create a new token with the correct secret
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'cg_analytics_jwt_secret_2025_production_key',
      { expiresIn: '7d' }
    );
    
    console.log('\nNew token created:');
    console.log(token);
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cg_analytics_jwt_secret_2025_production_key');
    console.log('\nToken verified successfully:', decoded);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestToken();