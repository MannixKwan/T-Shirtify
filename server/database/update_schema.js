const { pool } = require('./connection');

const updateSchema = async () => {
  try {
    console.log('🔄 Updating database schema...');

    // Drop foreign key constraints first
    await pool.execute('ALTER TABLE cart DROP FOREIGN KEY cart_ibfk_2');
    await pool.execute('ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2');
    await pool.execute('ALTER TABLE sales_analytics DROP FOREIGN KEY sales_analytics_ibfk_1');
    
    // Drop and recreate products table with new schema
    await pool.execute('DROP TABLE IF EXISTS products');
    
    await pool.execute(`
      CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        base_cost DECIMAL(10,2) NOT NULL DEFAULT 15.00,
        design_url VARCHAR(500),
        design_position JSON,
        author_id INT,
        author_name VARCHAR(255),
        quantity_sold INT DEFAULT 0,
        total_revenue DECIMAL(10,2) DEFAULT 0.00,
        rating DECIMAL(3,2) DEFAULT 0.00,
        review_count INT DEFAULT 0,
        sizes JSON,
        colors JSON,
        material VARCHAR(255),
        care_instructions TEXT,
        in_stock BOOLEAN DEFAULT TRUE,
        category VARCHAR(100) DEFAULT 'general',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Recreate foreign key constraints
    await pool.execute(`
      ALTER TABLE cart 
      ADD CONSTRAINT cart_ibfk_2 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);
    
    await pool.execute(`
      ALTER TABLE order_items 
      ADD CONSTRAINT order_items_ibfk_2 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);
    
    await pool.execute(`
      ALTER TABLE sales_analytics 
      ADD CONSTRAINT sales_analytics_ibfk_1 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);

    console.log('✅ Database schema updated successfully!');

  } catch (error) {
    console.error('❌ Error updating schema:', error);
    throw error;
  }
};

// Run update if this file is executed directly
if (require.main === module) {
  updateSchema()
    .then(() => {
      console.log('✅ Schema update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateSchema };