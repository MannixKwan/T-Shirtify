const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const designerRoutes = require('./routes/designers');
console.log('🔧 Loading designers route:', typeof designerRoutes, designerRoutes ? 'OK' : 'FAILED');

const app = express();
const PORT = process.env.PORT || 3001;
console.log('🔌 Server will listen on port:', PORT);

// Security middleware - configure to allow cross-origin images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - stricter for auth and admin routes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// More lenient rate limiting for public product endpoints
const productLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200 // limit each IP to 200 requests per minute for products
});

// Apply strict limiter to auth and admin routes
app.use('/api/auth', strictLimiter);
app.use('/api/admin', strictLimiter);
app.use('/api/cart', strictLimiter);
app.use('/api/orders', strictLimiter);

// Apply lenient limiter to product routes
app.use('/api/products', productLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - CORS is already handled by the cors middleware above
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/designers', designerRoutes);
console.log('✅ Designer routes registered at /api/designers');

// Debug: Log route registration
console.log('✅ Registered routes:');
console.log('  - /api/auth');
console.log('  - /api/products');
console.log('  - /api/cart');
console.log('  - /api/orders');
console.log('  - /api/admin');
console.log('  - /api/upload');
console.log('  - /api/designers');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'T-Shirtify API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - must be last, after all routes
// Only match if it's an API route and hasn't been handled
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log('❌ 404 - API route not found:', req.method, req.originalUrl, 'Path:', req.path, 'Base URL:', req.baseUrl);
    return res.status(404).json({ error: 'Route not found' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 T-Shirtify server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 