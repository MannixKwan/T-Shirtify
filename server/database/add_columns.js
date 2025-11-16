const { pool } = require('./connection');

const addColumns = async () => {
  try {
    console.log('🔄 Adding missing columns to products table...');

    // Add missing columns to products table
    const columns = [
      'ALTER TABLE products ADD COLUMN author_name VARCHAR(255)',
      'ALTER TABLE products ADD COLUMN quantity_sold INT DEFAULT 0',
      'ALTER TABLE products ADD COLUMN total_revenue DECIMAL(10,2) DEFAULT 0.00',
      'ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00',
      'ALTER TABLE products ADD COLUMN review_count INT DEFAULT 0',
      'ALTER TABLE products ADD COLUMN sizes JSON',
      'ALTER TABLE products ADD COLUMN colors JSON',
      'ALTER TABLE products ADD COLUMN material VARCHAR(255)',
      'ALTER TABLE products ADD COLUMN care_instructions TEXT',
      'ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT TRUE'
    ];

    for (const column of columns) {
      try {
        await pool.execute(column);
        console.log(`✅ Added column: ${column.split(' ')[4]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️  Column already exists: ${column.split(' ')[4]}`);
        } else {
          console.error(`❌ Error adding column: ${error.message}`);
        }
      }
    }

    console.log('✅ All columns added successfully!');

  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
};

// Run update if this file is executed directly
if (require.main === module) {
  addColumns()
    .then(() => {
      console.log('✅ Column addition completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Column addition failed:', error);
      process.exit(1);
    });
}

module.exports = { addColumns };