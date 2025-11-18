const { pool } = require('./connection');

const migrateRoles = async () => {
  try {
    console.log('🔄 Migrating user roles to support customer, merchant, and admin...');
    
    const connection = await pool.getConnection();
    
    // Check current role column definition
    const [columns] = await connection.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
    `);
    
    if (columns.length > 0) {
      const currentType = columns[0].COLUMN_TYPE;
      console.log(`Current role type: ${currentType}`);
      
      // Check if merchant role already exists
      if (currentType.includes("'merchant'")) {
        console.log('✅ Merchant role already exists in the database');
        connection.release();
        return;
      }
      
      // Update the ENUM to include merchant
      // MySQL doesn't support direct ALTER of ENUM, so we need to modify the column
      await connection.execute(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('customer', 'merchant', 'admin') DEFAULT 'customer'
      `);
      
      console.log('✅ Successfully updated role ENUM to include merchant');
    } else {
      console.log('⚠️  Role column not found, it will be created with the new schema');
    }
    
    connection.release();
    console.log('🎉 Role migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error migrating roles:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateRoles()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateRoles };


