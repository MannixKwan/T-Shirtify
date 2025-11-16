const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const { authenticateToken, requireCustomer } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [cartItems] = await connection.execute(`
      SELECT c.*, p.name, p.price, p.design_url, p.design_position
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    connection.release();

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Add tax/shipping logic here if needed

    res.json({
      items: cartItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, requireCustomer, [
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1, max: 10 }),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity, size } = req.body;
    const connection = await pool.getConnection();

    // Check if product exists and is active
    const [products] = await connection.execute(
      'SELECT id, price FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in cart
    const [existingItems] = await connection.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.user.id, product_id, size]
    );

    if (existingItems.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await connection.execute(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Add new item to cart
      await connection.execute(
        'INSERT INTO cart (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, quantity, size]
      );
    }

    connection.release();

    res.json({ message: 'Item added to cart successfully' });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item
router.put('/update', authenticateToken, requireCustomer, [
  body('cart_id').isInt({ min: 1 }),
  body('quantity').optional().isInt({ min: 1, max: 10 }),
  body('size').optional().isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cart_id, quantity, size } = req.body;
    const connection = await pool.getConnection();

    // Build update query dynamically based on what's provided
    const updates = [];
    const values = [];

    if (quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(quantity);
    }

    if (size !== undefined) {
      updates.push('size = ?');
      values.push(size);
    }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(cart_id, req.user.id);

    const [result] = await connection.execute(
      `UPDATE cart SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated successfully' });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/remove/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    await connection.execute(
      'DELETE FROM cart WHERE user_id = ?',
      [req.user.id]
    );

    connection.release();

    res.json({ message: 'Cart cleared successfully' });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router; 