const { pool } = require('./connection');
const bcrypt = require('bcryptjs');

const resetTestPasswords = async () => {
  try {
    console.log('🔧 Resetting test account passwords...');
    
    const connection = await pool.getConnection();
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Test accounts from seed.js
    const testAccounts = [
      'john@example.com',
      'jane@example.com',
      'rock@designs.com',
      'art@studio.com',
      'tech@wear.com',
      'admin@tshirtify.com'
    ];

    for (const email of testAccounts) {
      try {
        const [result] = await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [hashedPassword, email]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ Reset password for: ${email}`);
        } else {
          console.log(`⚠️  Account not found: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error resetting ${email}:`, error.message);
      }
    }

    // Also reset abcd test accounts
    const abcdPassword = await bcrypt.hash('abcd1234', 10);
    const abcdAccounts = [
      'abcd1@testing.com',
      'abcd2@testing.com',
      'abcd3@testing.com'
    ];

    for (const email of abcdAccounts) {
      try {
        const [result] = await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [abcdPassword, email]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ Reset password for: ${email}`);
        } else {
          console.log(`⚠️  Account not found: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error resetting ${email}:`, error.message);
      }
    }

    connection.release();
    
    console.log('\n🎉 Password reset completed!');
    console.log('\n📋 Test Account Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Main Test Accounts (password: password123):');
    console.log('  Customer: john@example.com / password123');
    console.log('  Customer: jane@example.com / password123');
    console.log('  Merchant: rock@designs.com / password123');
    console.log('  Merchant: art@studio.com / password123');
    console.log('  Merchant: tech@wear.com / password123');
    console.log('  Admin: admin@tshirtify.com / password123');
    console.log('\nABCD Test Accounts (password: abcd1234):');
    console.log('  Customer: abcd1@testing.com / abcd1234');
    console.log('  Merchant: abcd2@testing.com / abcd1234');
    console.log('  Admin: abcd3@testing.com / abcd1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    process.exit(1);
  }
};

resetTestPasswords();


