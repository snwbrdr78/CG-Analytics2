const { sequelize } = require('../models');

async function addArtistRole() {
  try {
    console.log('Adding artist role and artistId column to Users table...');
    
    // First check existing enum values
    const [enumValues] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'enum_Users_role'
      )
      ORDER BY enumsortorder;
    `);
    
    console.log('Current enum values:', enumValues.map(v => v.enumlabel));
    
    await sequelize.transaction(async (t) => {
      // Check if artist already exists in enum
      const hasArtist = enumValues.some(v => v.enumlabel === 'artist');
      
      if (!hasArtist) {
        // Add 'artist' to the enum without specifying position
        await sequelize.query(`
          ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'artist';
        `, { transaction: t });
        console.log('Added artist to role enum');
      } else {
        console.log('Artist role already exists in enum');
      }
      
      // Check Artists id type first
      const [artistIdType] = await sequelize.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Artists' AND column_name = 'id';
      `, { transaction: t });
      
      const idType = artistIdType[0]?.data_type === 'uuid' ? 'UUID' : 'INTEGER';
      console.log('Artists id type:', idType);
      
      // Add artistId column with correct type
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "artistId" ${idType} 
        REFERENCES "Artists"("id") ON DELETE SET NULL;
      `, { transaction: t });
      console.log('Added artistId column');
      
      // Add index on artistId for better performance
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS "users_artist_id_idx" ON "Users"("artistId");
      `, { transaction: t });
      console.log('Added index on artistId');
      
      console.log('✅ Artist role and artistId column added successfully');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding artist role:', error);
    process.exit(1);
  }
}

addArtistRole();