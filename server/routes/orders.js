const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const { authenticateToken, requireCustomer, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create order from cart (supports both authenticated and guest checkout)
router.post('/', [
  body('shipping_address').trim().isLength({ min: 10 }),
  body('payment_method').isIn(['credit_card', 'paypal', 'stripe']),
  body('cart_items').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shipping_address, payment_method, cart_items, email, full_name } = req.body;
    const connection = await pool.getConnection();

    let userId = null;
    let cartItems = [];

    // Check if user is authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const [users] = await connection.execute(
          'SELECT id, role FROM users WHERE id = ?',
          [decoded.userId]
        );
        if (users.length > 0 && users[0].role === 'customer') {
          userId = users[0].id;
        }
      } catch (error) {
        // Token invalid, proceed as guest
      }
    }

    if (userId) {
      // Authenticated user - get cart from database
      const [dbCartItems] = await connection.execute(`
        SELECT c.*, p.name, p.price, p.base_cost, p.author_id
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
      `, [userId]);

      cartItems = dbCartItems;
    } else {
      // Guest checkout - use cart_items from request body
      if (!cart_items || cart_items.length === 0) {
        connection.release();
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Validate and fetch product details for guest cart items
      for (const item of cart_items) {
        const [products] = await connection.execute(
          'SELECT id, price, base_cost, author_id FROM products WHERE id = ?',
          [item.product_id]
        );
        
        if (products.length === 0) {
          connection.release();
          return res.status(400).json({ error: `Product ${item.product_id} not found` });
        }

        const product = products[0];
        cartItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          price: product.price,
          base_cost: product.base_cost,
          author_id: product.author_id
        });
      }

      // Create a guest user account for the order
      if (email && full_name) {
        const bcrypt = require('bcryptjs');
        const guestPassword = await bcrypt.hash(Math.random().toString(36), 10);
        
        try {
          const [guestResult] = await connection.execute(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, guestPassword, full_name, 'customer']
          );
          userId = guestResult.insertId;
        } catch (error) {
          // If email already exists, find the user
          if (error.code === 'ER_DUP_ENTRY') {
            const [existingUsers] = await connection.execute(
              'SELECT id FROM users WHERE email = ?',
              [email]
            );
            if (existingUsers.length > 0) {
              userId = existingUsers[0].id;
            }
          } else {
            connection.release();
            return res.status(500).json({ error: 'Failed to create guest account' });
          }
        }
      } else {
        connection.release();
        return res.status(400).json({ error: 'Email and full name are required for guest checkout' });
      }
    }

    if (cartItems.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const total_amount = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    // Create order
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (user_id, total_amount, shipping_address, payment_status)
      VALUES (?, ?, ?, 'pending')
    `, [userId, total_amount, shipping_address]);

    const orderId = orderResult.insertId;

    // Create order items and update sales analytics
    for (const item of cartItems) {
      // Insert order item
      await connection.execute(`
        INSERT INTO order_items (order_id, product_id, quantity, size, price_per_unit, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.size, item.price, item.price * item.quantity]);

      // Update sales analytics
      await connection.execute(`
        INSERT INTO sales_analytics (product_id, author_id, quantity_sold, total_revenue, total_profit, last_sale_date)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        quantity_sold = quantity_sold + ?,
        total_revenue = total_revenue + ?,
        total_profit = total_profit + ?,
        last_sale_date = NOW()
      `, [
        item.product_id, 
        item.author_id, 
        item.quantity, 
        item.price * item.quantity, 
        (item.price - item.base_cost) * item.quantity,
        item.quantity,
        item.price * item.quantity,
        (item.price - item.base_cost) * item.quantity
      ]);
    }

    // Clear cart (only if authenticated user)
    if (userId && token) {
      await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
    }

    connection.release();

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      total_amount: parseFloat(total_amount.toFixed(2))
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders (allow all authenticated users, not just customers)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [orders] = await connection.execute(`
      SELECT o.*, 
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await connection.execute(`
        SELECT oi.*, p.name, p.design_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      return {
        ...order,
        items: items || []
      };
    }));

    connection.release();

    res.json({ orders: ordersWithItems });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details (allow all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Get order
    const [orders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const [orderItems] = await connection.execute(`
      SELECT oi.*, p.name, p.design_url, p.design_position
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    connection.release();

    res.json({
      order: orders[0],
      items: orderItems
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await connection.execute(query, params);
    connection.release();

    res.json({ orders });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('payment_status').optional().isIn(['pending', 'paid', 'failed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, payment_status } = req.body;
    const connection = await pool.getConnection();

    let updateQuery = 'UPDATE orders SET status = ?';
    const params = [status];

    if (payment_status) {
      updateQuery += ', payment_status = ?';
      params.push(payment_status);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    const [result] = await connection.execute(updateQuery, params);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get order statistics (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Total orders
    const [totalOrders] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    
    // Total revenue
    const [totalRevenue] = await connection.execute(`
      SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'
    `);
    
    // Orders by status
    const [ordersByStatus] = await connection.execute(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `);
    
    // Recent orders
    const [recentOrders] = await connection.execute(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    connection.release();

    res.json({
      totalOrders: totalOrders[0].count,
      totalRevenue: parseFloat(totalRevenue[0].total || 0),
      ordersByStatus,
      recentOrders
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

module.exports = router; 