# Image Storage Setup Guide

## Overview
This project now stores images locally in the filesystem and references them in the database. Images are served through the Express static file server.

## Directory Structure
```
server/uploads/
├── designs/     # Product design images
├── avatars/     # User/designer avatars
└── products/    # Additional product images
```

## Setup Steps

### 1. Add Avatar Column to Database
```bash
npm run add-avatar-column
```

### 2. Download Placeholder Images
```bash
npm run download-images
```
This will download:
- 8 product design images (800x800px)
- 4 designer avatar images (SVG)

### 3. Seed Database with Local Images
```bash
npm run seed-db
```

## Image Storage

### Product Images
- Stored in: `server/uploads/designs/`
- Database field: `products.design_url`
- Example: `/uploads/designs/rock-design.jpg`
- Served at: `http://localhost:3001/uploads/designs/rock-design.jpg`

### User Avatars
- Stored in: `server/uploads/avatars/`
- Database field: `users.avatar`
- Example: `/uploads/avatars/rock-designs-avatar.svg`
- Served at: `http://localhost:3001/uploads/avatars/rock-designs-avatar.svg`

## Upload Endpoints

### Upload User Avatar
```bash
POST /api/upload/avatar
Headers: Authorization: Bearer <token>
Body: multipart/form-data
  - avatar: <image file>
```

### Upload Product Image
```bash
POST /api/upload/product
Headers: Authorization: Bearer <token>
Body: multipart/form-data
  - image: <image file>
```

## Frontend Usage

Images are automatically served from the `/uploads` path. In your React components:

```jsx
// Product design image
<img src={`http://localhost:3001${product.design_url}`} alt={product.name} />

// User avatar
<img src={`http://localhost:3001${user.avatar}`} alt={user.name} />
```

Or configure your API base URL:
```jsx
const API_URL = 'http://localhost:3001';
<img src={`${API_URL}${product.design_url}`} alt={product.name} />
```

## Database Schema

### Users Table
```sql
ALTER TABLE users ADD COLUMN avatar VARCHAR(500);
```

### Products Table
Already has `design_url VARCHAR(500)` field.

## Notes

- Images are stored as files, not as BLOBs in the database
- File paths are stored in the database
- Static file serving is configured in `server/index.js`
- Maximum file sizes:
  - Avatars: 2MB
  - Product images: 5MB
- Supported formats: JPEG, JPG, PNG, GIF, WEBP

