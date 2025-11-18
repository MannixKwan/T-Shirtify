# User Roles Update - Customer, Merchant, and Admin

## Overview
The database schema has been updated to support **three user roles**:
- **Customer**: For viewing and purchasing products (current pages)
- **Merchant**: For managing their own products (pages to be built later)
- **Admin**: For platform administration (pages to be built later)

## Changes Made

### 1. Database Schema Updates
- **File**: `server/database/setup.js`
- **Change**: Updated `role` ENUM from `('customer', 'admin')` to `('customer', 'merchant', 'admin')`
- **Migration**: Created `server/database/migrate_roles.js` to update existing databases

### 2. Frontend Context Updates
- **File**: `client/src/context/AuthContext.js`
- **Added**: `isMerchant` property to check if user is a merchant
- **Available properties**:
  - `isAuthenticated`: Boolean - User is logged in
  - `isCustomer`: Boolean - User has customer role
  - `isMerchant`: Boolean - User has merchant role
  - `isAdmin`: Boolean - User has admin role

### 3. Backend Middleware Updates
- **File**: `server/middleware/auth.js`
- **Added middleware functions**:
  - `requireMerchant`: Ensures user has merchant role
  - `requireAdminOrMerchant`: Allows both admin and merchant access
- **Existing functions**:
  - `requireAdmin`: Admin-only access
  - `requireCustomer`: Customer-only access

### 4. Database Seeding Updates
- **File**: `server/database/seed.js`
- **Updated**: Sample users now include:
  - 2 Customer users
  - 3 Merchant users (Rock Designs, Art Studio, TechWear)
  - 1 Admin user
- **Products**: Now created by merchants (previously admins)

## Test Credentials

After running `npm run seed-db`, you can use these credentials:

### Customer
- **Email**: `john@example.com`
- **Password**: `password123`
- **Access**: Can view all current pages (homepage, products, cart, etc.)

### Merchant
- **Email**: `rock@designs.com`
- **Password**: `password123`
- **Access**: Will have access to merchant dashboard (to be built)

### Admin
- **Email**: `admin@tshirtify.com`
- **Password**: `password123`
- **Access**: Will have access to admin dashboard (to be built)

## Migration Instructions

If you have an existing database, run the migration:

```bash
npm run migrate-roles
```

This will update the `role` column in the `users` table to include the `merchant` role.

## Usage Examples

### Frontend (React)
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isCustomer, isMerchant, isAdmin } = useAuth();
  
  if (isCustomer) {
    // Show customer features
  }
  
  if (isMerchant) {
    // Show merchant features
  }
  
  if (isAdmin) {
    // Show admin features
  }
}
```

### Backend (Express)
```javascript
const { requireMerchant, requireAdminOrMerchant } = require('../middleware/auth');

// Merchant-only route
router.post('/merchant/products', authenticateToken, requireMerchant, async (req, res) => {
  // Only merchants can access this
});

// Admin or Merchant route
router.get('/products/manage', authenticateToken, requireAdminOrMerchant, async (req, res) => {
  // Both admins and merchants can access this
});
```

## Next Steps

1. **Customer Pages** (Already Built):
   - Homepage
   - Product pages
   - Shopping cart
   - Search functionality

2. **Merchant Pages** (To Be Built):
   - Merchant dashboard
   - Product management
   - Sales analytics
   - Order management

3. **Admin Pages** (To Be Built):
   - Admin dashboard
   - User management
   - Platform analytics
   - System settings

## Files Modified

- `server/database/setup.js` - Updated schema
- `server/database/migrate_roles.js` - New migration script
- `server/database/seed.js` - Updated seed data
- `server/middleware/auth.js` - Added merchant middleware
- `client/src/context/AuthContext.js` - Added isMerchant property
- `package.json` - Added migrate-roles script

## Notes

- All existing customer functionality remains unchanged
- Merchants can create products (same as admins previously)
- Role checks are backward compatible
- Migration is safe to run multiple times (idempotent)


