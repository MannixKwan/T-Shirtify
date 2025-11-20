const { pool } = require('./connection');

const addProfileColumns = async () => {
  try {
    console.log('🔄 Adding profile columns to users table...');
    
    const connection = await pool.getConnection();
    
    // Check and add phone column
    const [phoneColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'phone'
    `);
    
    if (phoneColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN phone VARCHAR(20) AFTER email
      `);
      console.log('✅ Phone column added successfully');
    } else {
      console.log('✅ Phone column already exists');
    }
    
    // Check and add address fields
    const [addressColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'address'
    `);
    
    if (addressColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN address TEXT AFTER phone
      `);
      console.log('✅ Address column added successfully');
    } else {
      console.log('✅ Address column already exists');
    }
    
    // Check and add city column
    const [cityColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'city'
    `);
    
    if (cityColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN city VARCHAR(100) AFTER address
      `);
      console.log('✅ City column added successfully');
    } else {
      console.log('✅ City column already exists');
    }
    
    // Check and add state column
    const [stateColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'state'
    `);
    
    if (stateColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN state VARCHAR(100) AFTER city
      `);
      console.log('✅ State column added successfully');
    } else {
      console.log('✅ State column already exists');
    }
    
    // Check and add zip_code column
    const [zipColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'zip_code'
    `);
    
    if (zipColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN zip_code VARCHAR(20) AFTER state
      `);
      console.log('✅ Zip code column added successfully');
    } else {
      console.log('✅ Zip code column already exists');
    }
    
    // Check and add country column
    const [countryColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'country'
    `);
    
    if (countryColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN country VARCHAR(100) DEFAULT 'United States' AFTER zip_code
      `);
      console.log('✅ Country column added successfully');
    } else {
      console.log('✅ Country column already exists');
    }
    
    // Check and add payment_method column
    const [paymentColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'payment_method'
    `);
    
    if (paymentColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN payment_method ENUM('credit_card', 'paypal', 'stripe') DEFAULT 'credit_card' AFTER country
      `);
      console.log('✅ Payment method column added successfully');
    } else {
      console.log('✅ Payment method column already exists');
    }
    
    connection.release();
    
    console.log('\n🎉 Profile columns migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding profile columns:', error);
    process.exit(1);
  }
};

addProfileColumns();



