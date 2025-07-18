const { sequelize } = require('../models');

async function migrateRoles() {
  try {
    console.log('🔄 Migrating user roles...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Update existing 'user' roles to 'analyst'
      await sequelize.query(`
        UPDATE "Users" SET "role" = 'analyst' WHERE "role" = 'user'
      `, { transaction });
      console.log('✅ Updated user roles to analyst');

      // Step 2: Update existing 'viewer' roles to 'analyst'
      await sequelize.query(`
        UPDATE "Users" SET "role" = 'analyst' WHERE "role" = 'viewer'
      `, { transaction });
      console.log('✅ Updated viewer roles to analyst');

      // Step 3: Drop the default constraint
      await sequelize.query(`
        ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT
      `, { transaction });
      console.log('✅ Dropped default constraint');

      // Step 4: Create new enum type
      await sequelize.query(`
        CREATE TYPE "enum_Users_role_new" AS ENUM ('super_admin', 'admin', 'editor', 'analyst', 'api_user')
      `, { transaction });
      console.log('✅ Created new enum type');

      // Step 5: Change column type
      await sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE "enum_Users_role_new" 
        USING "role"::text::"enum_Users_role_new"
      `, { transaction });
      console.log('✅ Changed column type');

      // Step 6: Drop old enum type
      await sequelize.query(`
        DROP TYPE "enum_Users_role"
      `, { transaction });
      console.log('✅ Dropped old enum type');

      // Step 7: Rename new enum type
      await sequelize.query(`
        ALTER TYPE "enum_Users_role_new" RENAME TO "enum_Users_role"
      `, { transaction });
      console.log('✅ Renamed new enum type');

      // Step 8: Set new default
      await sequelize.query(`
        ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'analyst'::"enum_Users_role"
      `, { transaction });
      console.log('✅ Set new default');

      await transaction.commit();
      console.log('✅ Migration completed successfully');

      // Verify the update
      const [users] = await sequelize.query(`
        SELECT "username", "email", "role" FROM "Users"
      `);
      console.log('\nCurrent users:');
      users.forEach(user => {
        console.log(`  ${user.username} (${user.email}): ${user.role}`);
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating roles:', error);
    process.exit(1);
  }
}

migrateRoles();