const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/designs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             COALESCE(p.quantity_sold, 0) as quantity_sold,
             COALESCE(p.total_revenue, 0) as total_revenue
      FROM products p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.in_stock = 1
    `;
    
    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await connection.execute(query, params);
    connection.release();

    // Add fallback avatar if not in database
    const productsWithAvatars = products.map(product => ({
      ...product,
      author_avatar: product.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(product.author_name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    }));

    res.json({ products: productsWithAvatars });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search products (public)
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    const connection = await pool.getConnection();

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get all products (including out of stock for search purposes)
    // Filter by in_stock only if explicitly set to FALSE/0
    const [allProducts] = await connection.execute(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             COALESCE(p.quantity_sold, 0) as quantity_sold,
             COALESCE(p.total_revenue, 0) as total_revenue
      FROM products p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.in_stock != 0 OR p.in_stock IS NULL
      ORDER BY p.quantity_sold DESC, p.created_at DESC
    `);
    
    // Filter products in JavaScript
    const searchTerm = q.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.author_name && product.author_name.toLowerCase().includes(searchTerm))
    );
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Add fallback avatar if not in database
    const productsWithAvatars = paginatedProducts.map(product => ({
      ...product,
      author_avatar: product.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(product.author_name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    }));
    
    connection.release();

    res.json({ 
      products: productsWithAvatars,
      query: q,
      total: filteredProducts.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get hot products (most sold in last 7 days)
router.get('/hot', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [products] = await connection.execute(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             COALESCE(recent_sales.quantity_sold, 0) as quantity_sold,
             COALESCE(recent_sales.total_revenue, 0) as total_revenue
      FROM products p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN (
        SELECT oi.product_id, 
               SUM(oi.quantity) as quantity_sold,
               SUM(oi.total_price) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND o.status IN ('delivered', 'shipped', 'processing')
        GROUP BY oi.product_id
      ) recent_sales ON p.id = recent_sales.product_id
      WHERE p.in_stock = 1
      ORDER BY recent_sales.quantity_sold DESC, p.quantity_sold DESC, p.created_at DESC
      LIMIT 8
    `);
    
    // Add fallback avatar if not in database
    const productsWithAvatars = products.map(product => ({
      ...product,
      author_avatar: product.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(product.author_name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    }));
    
    connection.release();
    res.json({ products: productsWithAvatars });
  } catch (error) {
    console.error('Get hot products error:', error);
    res.status(500).json({ error: 'Failed to fetch hot products' });
  }
});

// Get recommended products based on user order history
router.get('/recommended', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const userId = req.user?.id; // Get user ID from auth middleware
    
    let products;
    
    if (userId) {
      // Get recommendations based on user's order history
      const [userProducts] = await connection.execute(`
        SELECT DISTINCT p.category, p.author_id
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? AND o.status IN ('delivered', 'shipped', 'processing')
      `, [userId]);
      
      if (userProducts.length > 0) {
        // Get products from same categories or authors
        const categories = userProducts.map(p => p.category).filter(Boolean);
        const authors = userProducts.map(p => p.author_id).filter(Boolean);
        
        let whereClause = 'p.in_stock = TRUE AND p.id NOT IN (';
        whereClause += 'SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = ?)';
        
        const params = [userId];
        
        if (categories.length > 0) {
          whereClause += ' AND (p.category IN (' + categories.map(() => '?').join(',') + ')';
          params.push(...categories);
        }
        
        if (authors.length > 0) {
          whereClause += (categories.length > 0 ? ' OR' : ' AND (') + ' p.author_id IN (' + authors.map(() => '?').join(',') + ')';
          params.push(...authors);
        }
        
        if (categories.length > 0 || authors.length > 0) {
          whereClause += ')';
        }
        
        whereClause += ' ORDER BY RAND() LIMIT 12';
        
        [products] = await connection.execute(`
          SELECT p.*, u.name as author_name, u.avatar as author_avatar,
                 COALESCE(p.quantity_sold, 0) as quantity_sold
          FROM products p
          LEFT JOIN users u ON p.author_id = u.id
          WHERE ${whereClause}
        `, params);
        
        // Add fallback avatar if not in database
        products = products.map(product => ({
          ...product,
          author_avatar: product.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(product.author_name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
        }));
      } else {
        // No order history, return empty array
        products = [];
      }
    } else {
      // No user logged in, return empty array
      products = [];
    }
    
    connection.release();
    res.json({ products });
  } catch (error) {
    console.error('Get recommended products error:', error);
    res.status(500).json({ error: 'Failed to fetch recommended products' });
  }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [products] = await connection.execute(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             COALESCE(p.quantity_sold, 0) as quantity_sold,
             COALESCE(p.total_revenue, 0) as total_revenue
      FROM products p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ? AND p.in_stock = TRUE
    `, [id]);

    connection.release();

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add fallback avatar if not in database
    const product = {
      ...products[0],
      author_avatar: products[0].author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(products[0].author_name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    };

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('design'), [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('base_cost').optional().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('design_position').optional().isJSON()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, base_cost = 15.00, category = 'general', design_position } = req.body;
    const design_url = req.file ? `/uploads/designs/${req.file.filename}` : null;
    
    const connection = await pool.getConnection();

    const [result] = await connection.execute(`
      INSERT INTO products (name, description, price, base_cost, design_url, design_position, author_id, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, price, base_cost, design_url, design_position, req.user.id, category]);

    // Create sales analytics entry
    await connection.execute(`
      INSERT INTO sales_analytics (product_id, author_id, quantity_sold, total_revenue, total_profit)
      VALUES (?, ?, 0, 0.00, 0.00)
    `, [result.insertId, req.user.id]);

    connection.release();

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('design'), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('base_cost').optional().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('design_position').optional().isJSON(),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = {};
    const params = [];

    // Build dynamic update query
    if (req.body.name) {
      updateFields.name = '?';
      params.push(req.body.name);
    }
    if (req.body.description !== undefined) {
      updateFields.description = '?';
      params.push(req.body.description);
    }
    if (req.body.price) {
      updateFields.price = '?';
      params.push(req.body.price);
    }
    if (req.body.base_cost) {
      updateFields.base_cost = '?';
      params.push(req.body.base_cost);
    }
    if (req.body.category) {
      updateFields.category = '?';
      params.push(req.body.category);
    }
    if (req.body.design_position) {
      updateFields.design_position = '?';
      params.push(req.body.design_position);
    }
    if (req.body.is_active !== undefined) {
      updateFields.is_active = '?';
      params.push(req.body.is_active);
    }
    if (req.file) {
      updateFields.design_url = '?';
      params.push(`/uploads/designs/${req.file.filename}`);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const connection = await pool.getConnection();
    
    const setClause = Object.keys(updateFields).map(field => `${field} = ${updateFields[field]}`).join(', ');
    const [result] = await connection.execute(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      params
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'DELETE FROM products WHERE id = ? AND author_id = ?',
      [id, req.user.id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router; 