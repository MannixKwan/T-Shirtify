const { pool } = require('./connection');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await pool.execute('DELETE FROM order_items');
    await pool.execute('DELETE FROM orders');
    await pool.execute('DELETE FROM cart');
    await pool.execute('DELETE FROM products');
    await pool.execute('DELETE FROM users WHERE role = "customer"');
    await pool.execute('DELETE FROM users WHERE role = "merchant"');
    await pool.execute('DELETE FROM users WHERE email IN ("rock@designs.com", "art@studio.com", "tech@wear.com", "admin@tshirtify.com")');

    console.log('✅ Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'customer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'customer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JaneSmith&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
      },
      {
        name: 'Rock Designs',
        email: 'rock@designs.com',
        password: hashedPassword,
        role: 'merchant',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RockDesigns&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
      },
      {
        name: 'Art Studio',
        email: 'art@studio.com',
        password: hashedPassword,
        role: 'merchant',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtStudio&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
      },
      {
        name: 'TechWear',
        email: 'tech@wear.com',
        password: hashedPassword,
        role: 'merchant',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechWear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
      },
      {
        name: 'Admin User',
        email: 'admin@tshirtify.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
      }
    ];

    for (const user of users) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role]
      );
    }

    console.log('✅ Created sample users');

    // Get user IDs for product authors (merchants and admins can create products)
    const [adminUsers] = await pool.execute(
      'SELECT id, name FROM users WHERE role IN ("admin", "merchant")'
    );

    // Create a map of author names to avatars
    const authorAvatars = {
      'Rock Designs': 'https://api.dicebear.com/7.x/avataaars/svg?seed=RockDesigns&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'Art Studio': 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtStudio&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'TechWear': 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechWear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'Admin User': 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'
    };

    // Create sample products
    const products = [
      {
        name: "Vintage Rock T-Shirt",
        price: 29.99,
        description: "A classic vintage rock design featuring bold typography and retro aesthetics. Perfect for music lovers and vintage enthusiasts who want to make a statement with their style.",
        design_url: "https://picsum.photos/seed/rock-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 60, height: 60 }),
        author_id: adminUsers[0].id,
        author_name: adminUsers[0].name,
        author_avatar: authorAvatars[adminUsers[0].name] || null,
        quantity_sold: 45,
        total_revenue: 1349.55,
        rating: 4.5,
        review_count: 23,
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['White', 'Black', 'Navy', 'Gray']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Minimalist Art Print",
        price: 24.99,
        description: "Clean and modern minimalist design that speaks volumes through simplicity. Perfect for those who appreciate understated elegance and contemporary style.",
        design_url: "https://picsum.photos/seed/art-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 70, height: 70 }),
        author_id: adminUsers[1].id,
        author_name: adminUsers[1].name,
        author_avatar: authorAvatars[adminUsers[1].name] || null,
        quantity_sold: 32,
        total_revenue: 799.68,
        rating: 4.3,
        review_count: 18,
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['White', 'Black', 'Cream']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Tech Geek Collection",
        price: 34.99,
        description: "For the tech enthusiasts and coding wizards. This design celebrates the digital age with sleek, modern graphics that any programmer would be proud to wear.",
        design_url: "https://picsum.photos/seed/tech-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 65, height: 65 }),
        author_id: adminUsers[2].id,
        author_name: adminUsers[2].name,
        author_avatar: authorAvatars[adminUsers[2].name] || null,
        quantity_sold: 67,
        total_revenue: 2344.33,
        rating: 4.7,
        review_count: 31,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Black', 'Navy', 'Dark Gray']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Nature Explorer",
        price: 27.99,
        description: "Inspired by the great outdoors, this design captures the spirit of adventure and exploration. Perfect for nature lovers and outdoor enthusiasts.",
        design_url: "https://picsum.photos/seed/nature-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 55, height: 55 }),
        author_id: adminUsers[0].id,
        author_name: adminUsers[0].name,
        author_avatar: authorAvatars[adminUsers[0].name] || null,
        quantity_sold: 23,
        total_revenue: 643.77,
        rating: 4.2,
        review_count: 12,
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Forest Green', 'Brown', 'Olive']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Abstract Geometry",
        price: 31.99,
        description: "Bold geometric patterns and abstract shapes create a striking visual impact. This design is perfect for those who love contemporary art and modern aesthetics.",
        design_url: "https://picsum.photos/seed/art-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 75, height: 75 }),
        author_id: adminUsers[1].id,
        author_name: adminUsers[1].name,
        author_avatar: authorAvatars[adminUsers[1].name] || null,
        quantity_sold: 18,
        total_revenue: 575.82,
        rating: 4.4,
        review_count: 9,
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['White', 'Black', 'Yellow', 'Orange']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Retro Gaming",
        price: 26.99,
        description: "Nostalgic gaming design that takes you back to the golden age of arcade games. Perfect for gamers and retro enthusiasts who want to show off their love for classic gaming.",
        design_url: "https://picsum.photos/seed/gaming-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 80, height: 80 }),
        author_id: adminUsers[2].id,
        author_name: adminUsers[2].name,
        author_avatar: authorAvatars[adminUsers[2].name] || null,
        quantity_sold: 89,
        total_revenue: 2402.11,
        rating: 4.8,
        review_count: 45,
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Black', 'Navy', 'Purple', 'Pink']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Urban Street Style",
        price: 33.99,
        description: "Edgy urban design that captures the essence of street culture and modern city life. Perfect for those who love contemporary street fashion and urban aesthetics.",
        design_url: "https://picsum.photos/seed/urban-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 70, height: 70 }),
        author_id: adminUsers[0].id,
        author_name: adminUsers[0].name,
        author_avatar: authorAvatars[adminUsers[0].name] || null,
        quantity_sold: 56,
        total_revenue: 1903.44,
        rating: 4.6,
        review_count: 28,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Black', 'White', 'Gray', 'Navy']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      },
      {
        name: "Ocean Waves",
        price: 28.99,
        description: "Inspired by the calming beauty of ocean waves, this design brings a sense of peace and tranquility. Perfect for beach lovers and those who find solace in the sea.",
        design_url: "https://picsum.photos/seed/ocean-design/800/800",
        design_position: JSON.stringify({ x: 50, y: 50, width: 60, height: 60 }),
        author_id: adminUsers[1].id,
        author_name: adminUsers[1].name,
        author_avatar: authorAvatars[adminUsers[1].name] || null,
        quantity_sold: 34,
        total_revenue: 985.66,
        rating: 4.3,
        review_count: 16,
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Ocean Blue', 'Teal', 'White', 'Navy']),
        material: "100% Premium Cotton",
        care_instructions: "Machine wash cold, tumble dry low",
        in_stock: true
      }
    ];

    for (const product of products) {
      await pool.execute(
        `INSERT INTO products (name, price, description, design_url, design_position, author_id, author_name, quantity_sold, total_revenue, rating, review_count, sizes, colors, material, care_instructions, in_stock, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          product.name,
          product.price,
          product.description,
          product.design_url,
          product.design_position,
          product.author_id,
          product.author_name,
          product.quantity_sold,
          product.total_revenue,
          product.rating,
          product.review_count,
          product.sizes,
          product.colors,
          product.material,
          product.care_instructions,
          product.in_stock
        ]
      );
    }

    console.log('✅ Created sample products');

    // Create some sample cart items for a user
    const [customer] = await pool.execute(
      'SELECT id FROM users WHERE email = "john@example.com"'
    );

    if (customer.length > 0) {
      const cartItems = [
        { product_id: 1, user_id: customer[0].id, size: 'M', quantity: 2 },
        { product_id: 3, user_id: customer[0].id, size: 'L', quantity: 1 }
      ];

      for (const item of cartItems) {
        await pool.execute(
          'INSERT INTO cart (product_id, user_id, size, quantity) VALUES (?, ?, ?, ?)',
          [item.product_id, item.user_id, item.size, item.quantity]
        );
      }

      console.log('✅ Created sample cart items');
    }

    // Create some sample orders
    const sampleOrders = [
      {
        user_id: customer[0].id,
        total_amount: 89.97,
        status: 'delivered',
        shipping_address: '123 Main St, City, State 12345'
      },
      {
        user_id: customer[0].id,
        total_amount: 54.98,
        status: 'pending',
        shipping_address: '123 Main St, City, State 12345'
      }
    ];

    for (const order of sampleOrders) {
      const [result] = await pool.execute(
        'INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at) VALUES (?, ?, ?, ?, NOW())',
        [order.user_id, order.total_amount, order.status, order.shipping_address]
      );

      // Add order items
      const orderItems = [
        { order_id: result.insertId, product_id: 1, quantity: 1, price_per_unit: 29.99, total_price: 29.99, size: 'M' },
        { order_id: result.insertId, product_id: 2, quantity: 2, price_per_unit: 24.99, total_price: 49.98, size: 'L' }
      ];

      for (const item of orderItems) {
        await pool.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, size) VALUES (?, ?, ?, ?, ?, ?)',
          [item.order_id, item.product_id, item.quantity, item.price_per_unit, item.total_price, item.size]
        );
      }
    }

    console.log('✅ Created sample orders');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${users.length} users created`);
    console.log(`- ${products.length} products created`);
    console.log('- Sample cart items and orders created');
    console.log('\n🔑 Test Credentials:');
    console.log('Customer: john@example.com / password123');
    console.log('Merchant: rock@designs.com / password123');
    console.log('Admin: admin@tshirtify.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };