const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directories exist
const uploadDirs = {
  designs: 'server/uploads/designs',
  avatars: 'server/uploads/avatars',
  products: 'server/uploads/products'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.avatars);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for product image uploads
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.products);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter
});

const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload user avatar
router.post('/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const connection = await pool.getConnection();

    // Get old avatar path to delete it later
    const [users] = await connection.execute(
      'SELECT avatar FROM users WHERE id = ?',
      [req.user.id]
    );

    // Update user avatar
    await connection.execute(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarPath, req.user.id]
    );

    connection.release();

    // Delete old avatar file if it exists and is a local file
    if (users[0]?.avatar && users[0].avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', users[0].avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: avatarPath
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload product image
router.post('/product', authenticateToken, productUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = `/uploads/products/${req.file.filename}`;

    res.json({
      message: 'Product image uploaded successfully',
      imageUrl: imagePath
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({ error: 'Failed to upload product image' });
  }
});

module.exports = router;


