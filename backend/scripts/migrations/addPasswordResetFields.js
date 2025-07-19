const { sequelize } = require('../models');

async function addPasswordResetFields() {
  try {
    console.log('Adding password reset fields to Users table...');
    
    await sequelize.transaction(async (t) => {
      // Add resetPasswordToken column
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "resetPasswordToken" VARCHAR(255);
      `, { transaction: t });
      
      // Add resetPasswordExpires column
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP WITH TIME ZONE;
      `, { transaction: t });
      
      // Add index on resetPasswordToken for faster lookups
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS "users_reset_password_token_idx" 
        ON "Users"("resetPasswordToken") 
        WHERE "resetPasswordToken" IS NOT NULL;
      `, { transaction: t });
      
      console.log('✅ Password reset fields added successfully');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding password reset fields:', error);
    process.exit(1);
  }
}

addPasswordResetFields();