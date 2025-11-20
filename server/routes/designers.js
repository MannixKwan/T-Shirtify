const express = require('express');
const { pool } = require('../database/connection');
const { authenticateToken, requireMerchant } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/banners/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
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

// Get designer/merchant profile and products
router.get('/:id', async (req, res) => {
  console.log('🎨 Designer route hit! Method:', req.method, 'Path:', req.path, 'ID:', req.params.id);
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Get designer info
    const [designers] = await connection.execute(`
      SELECT id, name, email, avatar, banner, description, role, created_at
      FROM users
      WHERE id = ? AND role IN ('merchant', 'admin')
    `, [id]);

    if (designers.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Designer not found' });
    }

    const designer = designers[0];

    // Get designer's products
    const [products] = await connection.execute(`
      SELECT p.*, 
             COALESCE(p.quantity_sold, 0) as quantity_sold,
             COALESCE(p.total_revenue, 0) as total_revenue
      FROM products p
      WHERE p.author_id = ? AND (p.in_stock != 0 OR p.in_stock IS NULL)
      ORDER BY p.created_at DESC
    `, [id]);

    // Add fallback avatar if not in database
    const productsWithAvatars = products.map(product => ({
      ...product,
      author_avatar: designer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(designer.name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    }));

    connection.release();

    res.json({
      designer: {
        ...designer,
        avatar: designer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(designer.name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
      },
      products: productsWithAvatars
    });

  } catch (error) {
    console.error('Get designer error:', error);
    res.status(500).json({ error: 'Failed to fetch designer information' });
  }
});

// Update merchant/designer profile (only for merchants themselves or admins)
router.put('/:id/profile', authenticateToken, upload.single('banner'), async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const connection = await pool.getConnection();

    // Check if user is the merchant themselves or an admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      connection.release();
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    // Check if user is a merchant or admin
    const [users] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0 || (users[0].role !== 'merchant' && users[0].role !== 'admin')) {
      connection.release();
      return res.status(404).json({ error: 'Designer not found' });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (req.file) {
      updates.push('banner = ?');
      values.push(`/uploads/banners/${req.file.filename}`);
    }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await connection.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated designer
    const [updatedDesigners] = await connection.execute(`
      SELECT id, name, email, avatar, banner, description, role, created_at
      FROM users
      WHERE id = ?
    `, [id]);

    connection.release();

    res.json({
      message: 'Designer profile updated successfully',
      designer: updatedDesigners[0]
    });

  } catch (error) {
    console.error('Update designer profile error:', error);
    res.status(500).json({ error: 'Failed to update designer profile' });
  }
});

module.exports = router;

