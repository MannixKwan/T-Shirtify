const { pool } = require('./connection');

const createDatabase = async () => {
  try {
    // Create a connection without specifying database
    const tempPool = require('mysql2/promise').createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create database if it doesn't exist
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'tshirtify_db'}`);
    console.log('✅ Database created or already exists');
    
    tempPool.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    // Continue anyway, the database might already exist
  }
};

const createTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('customer', 'merchant', 'admin') DEFAULT 'customer',
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
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

    // Cart table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cart_item (user_id, product_id, size)
      )
    `);

    // Orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Order items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Sales analytics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        author_id INT NOT NULL,
        quantity_sold INT DEFAULT 0,
        total_revenue DECIMAL(10,2) DEFAULT 0.00,
        total_profit DECIMAL(10,2) DEFAULT 0.00,
        last_sale_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_author (product_id, author_id)
      )
    `);

    connection.release();
    console.log('✅ Database tables created successfully');

    // Run role migration to ensure merchant role is available
    const { migrateRoles } = require('./migrate_roles');
    await migrateRoles();

    // Insert default admin user
    await insertDefaultAdmin();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

const insertDefaultAdmin = async () => {
  try {
    const connection = await pool.getConnection();
    const bcrypt = require('bcryptjs');
    
    // Check if admin already exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@tshirtify.com']
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(`
        INSERT INTO users (email, password, name, role) 
        VALUES (?, ?, ?, ?)
      `, ['admin@tshirtify.com', hashedPassword, 'Admin User', 'admin']);
      
      console.log('✅ Default admin user created (email: admin@tshirtify.com, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    connection.release();
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  createDatabase()
    .then(() => createTables())
    .then(() => {
      console.log('🎉 Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createDatabase, createTables }; 