const { pool } = require('./connection');

const viewDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('📊 Database Tables and Data\n');
    console.log('='.repeat(60));
    
    // Get all tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    
    console.log(`\n📋 Found ${tables.length} tables:\n`);
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // Show data from each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      // Get row count
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      const count = countResult[0].count;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Table: ${tableName} (${count} rows)`);
      console.log('='.repeat(60));
      
      if (count > 0) {
        // Get all data
        const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 20`);
        
        if (rows.length > 0) {
          // Print column headers
          const columns = Object.keys(rows[0]);
          console.log('\nColumns:', columns.join(', '));
          console.log('\nSample Data:');
          
          // Print rows
          rows.forEach((row, index) => {
            console.log(`\n[Row ${index + 1}]`);
            columns.forEach(col => {
              const value = row[col];
              // Truncate long values
              const displayValue = typeof value === 'string' && value.length > 50 
                ? value.substring(0, 50) + '...' 
                : value;
              console.log(`  ${col}: ${displayValue}`);
            });
          });
          
          if (count > 20) {
            console.log(`\n... and ${count - 20} more rows`);
          }
        }
      } else {
        console.log('  (No data)');
      }
    }
    
    // Show users with roles
    console.log(`\n${'='.repeat(60)}`);
    console.log('👥 Users Summary');
    console.log('='.repeat(60));
    const [users] = await connection.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.count} users`);
    });
    
    // Show products summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('🛍️  Products Summary');
    console.log('='.repeat(60));
    const [products] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN in_stock = 1 THEN 1 ELSE 0 END) as in_stock,
        SUM(quantity_sold) as total_sold,
        SUM(total_revenue) as total_revenue
      FROM products
    `);
    if (products[0]) {
      console.log(`  Total Products: ${products[0].total}`);
      console.log(`  In Stock: ${products[0].in_stock}`);
      console.log(`  Total Sold: ${products[0].total_sold || 0}`);
      console.log(`  Total Revenue: $${parseFloat(products[0].total_revenue || 0).toFixed(2)}`);
    }
    
    connection.release();
    console.log(`\n${'='.repeat(60)}\n`);
    console.log('✅ Database view completed!');
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  viewDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed:', error);
      process.exit(1);
    });
}

module.exports = { viewDatabase };

