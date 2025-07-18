const { sequelize } = require('../models');

async function updateRoleEnum() {
  try {
    console.log('🔄 Updating role enum in database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get current enum values
    const [currentEnumValues] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::"enum_Users_role"))::text as value
    `);
    console.log('Current enum values:', currentEnumValues.map(r => r.value));

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Create a new enum type with all values
      await sequelize.query(`
        CREATE TYPE "enum_Users_role_new" AS ENUM ('super_admin', 'admin', 'editor', 'analyst', 'api_user')
      `, { transaction });

      // Update the column to use the new enum
      await sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE "enum_Users_role_new" 
        USING "role"::text::"enum_Users_role_new"
      `, { transaction });

      // Drop the old enum type
      await sequelize.query(`
        DROP TYPE "enum_Users_role"
      `, { transaction });

      // Rename the new enum type
      await sequelize.query(`
        ALTER TYPE "enum_Users_role_new" RENAME TO "enum_Users_role"
      `, { transaction });

      await transaction.commit();
      console.log('✅ Role enum updated successfully');

      // Verify the update
      const [newEnumValues] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::"enum_Users_role"))::text as value
      `);
      console.log('New enum values:', newEnumValues.map(r => r.value));

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating role enum:', error);
    process.exit(1);
  }
}

updateRoleEnum();