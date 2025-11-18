# 🚀 Quick Start Guide - Running T-Shirtify Locally

## Prerequisites
- ✅ Node.js (v16 or higher) - **You have v16.14.1**
- ✅ MySQL (v8.0 or higher)
- ✅ npm or yarn

## Step-by-Step Instructions

### 1. ✅ Install Dependencies (Already Done!)
```bash
npm run install-all
```

### 2. Configure Environment Variables

Your `.env` file already exists. Make sure it contains:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=tshirtify_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=server/uploads/designs/

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important**: 
- Replace `your_mysql_password` with your actual MySQL root password
- Replace `your_super_secret_jwt_key_here` with a secure random string

### 3. Start MySQL Server

Make sure MySQL is running on your system:

**macOS:**
```bash
# Check if MySQL is running
brew services list | grep mysql

# If not running, start it:
brew services start mysql
# OR
mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
# OR
sudo service mysql start
```

**Windows:**
- Start MySQL from Services or use MySQL Workbench

### 4. Set Up Database

Create the database and tables:

```bash
npm run setup-db
```

This will:
- Create the `tshirtify_db` database (if it doesn't exist)
- Create all necessary tables (users, products, cart, orders, etc.)

### 5. (Optional) Seed Database with Sample Data

Populate the database with sample products, users, and orders:

```bash
npm run seed-db
```

This creates:
- Sample admin user: `admin@tshirtify.com` / `admin123`
- Sample customer users
- Sample products with designs
- Sample cart items and orders

### 6. Start the Application

**Option A: Run Both Servers Together (Recommended)**
```bash
npm run dev
```

This starts:
- **Backend Server**: http://localhost:3001
- **Frontend Server**: http://localhost:3000

**Option B: Run Servers Separately**

Terminal 1 (Backend):
```bash
npm run server
# OR
PORT=3001 node server/index.js
```

Terminal 2 (Frontend):
```bash
npm run client
# OR
cd client && npm start
```

### 7. Access the Application

Once both servers are running:

- **Frontend (React App)**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 🎯 Quick Commands Reference

```bash
# Install all dependencies
npm run install-all

# Set up database (create tables)
npm run setup-db

# Seed database (add sample data)
npm run seed-db

# Start both frontend and backend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
npm run build
```

## 🔧 Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` error:
```bash
# Kill processes on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill processes on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MySQL Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check your password in `.env` matches your MySQL root password
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Database Setup Issues
- Make sure MySQL is running before running `npm run setup-db`
- Check that your MySQL user has CREATE DATABASE privileges
- If tables already exist, you may need to drop and recreate them

## 📝 Default Login Credentials (After Seeding)

**Admin:**
- Email: `admin@tshirtify.com`
- Password: `admin123`

**Customer (Sample):**
- Email: `customer@example.com`
- Password: `password123`

## 🎨 Features Available

- ✅ Browse products on homepage
- ✅ Search for products by name/designer
- ✅ View product details
- ✅ Add items to cart
- ✅ User authentication
- ✅ Admin dashboard (after admin login)

---

**Need Help?** Check the main `README.md` for more detailed information.


