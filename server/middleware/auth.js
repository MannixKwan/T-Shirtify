const jwt = require('jsonwebtoken');
const { pool } = require('../database/connection');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Customer access required' });
  }
  next();
};

const requireMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant') {
    return res.status(403).json({ error: 'Merchant access required' });
  }
  next();
};

const requireAdminOrMerchant = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'merchant') {
    return res.status(403).json({ error: 'Admin or Merchant access required' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, requireCustomer, requireMerchant, requireAdminOrMerchant }; 