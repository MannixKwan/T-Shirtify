const { pool } = require('./connection');
const bcrypt = require('bcryptjs');

const createTestUsers = async () => {
  try {
    console.log('🔧 Creating test user accounts...');
    
    const connection = await pool.getConnection();
    
    // Test users to create
    const testUsers = [
      {
        name: 'Test Customer',
        email: 'abcd1@testing.com',
        password: 'abcd1234',
        role: 'customer'
      },
      {
        name: 'Test Merchant',
        email: 'abcd2@testing.com',
        password: 'abcd1234',
        role: 'merchant'
      },
      {
        name: 'Test Admin',
        email: 'abcd3@testing.com',
        password: 'abcd1234',
        role: 'admin'
      }
    ];

    for (const user of testUsers) {
      try {
        // Check if user already exists
        const [existingUsers] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );

        if (existingUsers.length > 0) {
          // Update existing user
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await connection.execute(
            'UPDATE users SET password = ?, name = ?, role = ? WHERE email = ?',
            [hashedPassword, user.name, user.role, user.email]
          );
          console.log(`✅ Updated user: ${user.email} (${user.role})`);
        } else {
          // Create new user
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [user.name, user.email, hashedPassword, user.role]
          );
          console.log(`✅ Created user: ${user.email} (${user.role})`);
        }
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  User already exists: ${user.email}`);
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error.message);
        }
      }
    }

    connection.release();
    
    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Test Account Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Customer:');
    console.log('  Email:    abcd1@testing.com');
    console.log('  Password: abcd1234');
    console.log('\nMerchant:');
    console.log('  Email:    abcd2@testing.com');
    console.log('  Password: abcd1234');
    console.log('\nAdmin:');
    console.log('  Email:    abcd3@testing.com');
    console.log('  Password: abcd1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createTestUsers()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUsers };


