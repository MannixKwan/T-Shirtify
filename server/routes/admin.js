const express = require('express');
const { pool } = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Total products
    const [totalProducts] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
    
    // Total customers
    const [totalCustomers] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
    
    // Total revenue
    const [totalRevenue] = await connection.execute(`
      SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'
    `);
    
    // Total profit
    const [totalProfit] = await connection.execute(`
      SELECT SUM(total_profit) as total FROM sales_analytics
    `);

    // Recent sales
    const [recentSales] = await connection.execute(`
      SELECT sa.*, p.name as product_name, u.name as author_name
      FROM sales_analytics sa
      JOIN products p ON sa.product_id = p.id
      JOIN users u ON sa.author_id = u.id
      ORDER BY sa.last_sale_date DESC
      LIMIT 10
    `);

    // Top selling products
    const [topProducts] = await connection.execute(`
      SELECT p.name, sa.quantity_sold, sa.total_revenue, sa.total_profit
      FROM sales_analytics sa
      JOIN products p ON sa.product_id = p.id
      ORDER BY sa.quantity_sold DESC
      LIMIT 5
    `);

    connection.release();

    res.json({
      totalProducts: totalProducts[0].count,
      totalCustomers: totalCustomers[0].count,
      totalRevenue: parseFloat(totalRevenue[0].total || 0),
      totalProfit: parseFloat(totalProfit[0].total || 0),
      recentSales,
      topProducts
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get author's products and analytics
router.get('/my-products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [products] = await connection.execute(`
      SELECT p.*, 
             COALESCE(sa.quantity_sold, 0) as quantity_sold,
             COALESCE(sa.total_revenue, 0) as total_revenue,
             COALESCE(sa.total_profit, 0) as total_profit,
             sa.last_sale_date
      FROM products p
      LEFT JOIN sales_analytics sa ON p.id = sa.product_id
      WHERE p.author_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    // Calculate totals
    const totals = products.reduce((acc, product) => {
      acc.totalProducts += 1;
      acc.totalSold += product.quantity_sold;
      acc.totalRevenue += parseFloat(product.total_revenue);
      acc.totalProfit += parseFloat(product.total_profit);
      return acc;
    }, { totalProducts: 0, totalSold: 0, totalRevenue: 0, totalProfit: 0 });

    connection.release();

    res.json({
      products,
      totals: {
        ...totals,
        totalRevenue: parseFloat(totals.totalRevenue.toFixed(2)),
        totalProfit: parseFloat(totals.totalProfit.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get sales analytics for specific product
router.get('/product/:id/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Verify product belongs to admin
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ? AND author_id = ?',
      [id, req.user.id]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get sales analytics
    const [analytics] = await connection.execute(`
      SELECT * FROM sales_analytics WHERE product_id = ?
    `, [id]);

    // Get order history for this product
    const [orderHistory] = await connection.execute(`
      SELECT oi.*, o.created_at as order_date, o.status, u.name as customer_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE oi.product_id = ?
      ORDER BY o.created_at DESC
    `, [id]);

    connection.release();

    res.json({
      product: products[0],
      analytics: analytics[0] || {
        quantity_sold: 0,
        total_revenue: 0,
        total_profit: 0
      },
      orderHistory
    });

  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

// Get monthly sales report
router.get('/sales-report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { year, month } = req.query;
    const connection = await pool.getConnection();

    let dateFilter = '';
    const params = [];

    if (year && month) {
      dateFilter = 'WHERE YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?';
      params.push(parseInt(year), parseInt(month));
    }

    const [monthlySales] = await connection.execute(`
      SELECT 
        DATE(o.created_at) as sale_date,
        COUNT(DISTINCT o.id) as orders_count,
        SUM(oi.quantity) as items_sold,
        SUM(oi.total_price) as daily_revenue,
        SUM(oi.total_price - (p.base_cost * oi.quantity)) as daily_profit
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ${dateFilter}
      GROUP BY DATE(o.created_at)
      ORDER BY sale_date DESC
    `, params);

    connection.release();

    res.json({ monthlySales });

  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

// Get customer analytics
router.get('/customer-analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Top customers by order value
    const [topCustomers] = await connection.execute(`
      SELECT u.name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    // Customer registration trend
    const [registrationTrend] = await connection.execute(`
      SELECT DATE(created_at) as reg_date, COUNT(*) as new_customers
      FROM users
      WHERE role = 'customer'
      GROUP BY DATE(created_at)
      ORDER BY reg_date DESC
      LIMIT 30
    `);

    connection.release();

    res.json({
      topCustomers,
      registrationTrend
    });

  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

module.exports = router; 