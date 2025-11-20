const { pool } = require('./connection');

const addDesignerFields = async () => {
  try {
    console.log('🔄 Adding designer fields to users table...');
    
    const connection = await pool.getConnection();
    
    // Check and add banner column
    const [bannerColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'banner'
    `);
    
    if (bannerColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN banner VARCHAR(500) AFTER avatar
      `);
      console.log('✅ Banner column added successfully');
    } else {
      console.log('✅ Banner column already exists');
    }
    
    // Check and add description column
    const [descriptionColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'description'
    `);
    
    if (descriptionColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN description TEXT AFTER banner
      `);
      console.log('✅ Description column added successfully');
    } else {
      console.log('✅ Description column already exists');
    }
    
    connection.release();
    
    console.log('\n🎉 Designer fields migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding designer fields:', error);
    process.exit(1);
  }
};

addDesignerFields();



