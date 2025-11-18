const { pool } = require('./connection');

const addAvatarColumn = async () => {
  try {
    console.log('🔄 Adding avatar column to users table...');
    
    const connection = await pool.getConnection();
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'avatar'
    `);
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN avatar VARCHAR(500) AFTER role
      `);
      console.log('✅ Avatar column added successfully');
    } else {
      console.log('✅ Avatar column already exists');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding avatar column:', error);
    process.exit(1);
  }
};

addAvatarColumn();


