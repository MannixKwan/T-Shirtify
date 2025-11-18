# 📊 How to View Database Tables and Data

This guide shows you multiple ways to check your database tables and data.

## Method 1: Using the View Script (Easiest) ⭐

I've created a convenient script that shows all tables and their data:

```bash
npm run view-db
```

This will display:
- All tables in the database
- Row counts for each table
- Sample data from each table
- Summary statistics (users by role, product stats, etc.)

**Example Output:**
```
📊 Database Tables and Data
📋 Found 6 tables:
  - cart
  - order_items
  - orders
  - products
  - sales_analytics
  - users

📦 Table: users (6 rows)
  Columns: id, email, password, name, role, created_at, updated_at
  [Sample data shown...]
```

## Method 2: Using MySQL Command Line

### Connect to MySQL
```bash
mysql -u root -p
# Enter your password when prompted
```

### Or connect directly to your database
```bash
mysql -u root -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -D $(grep DB_NAME .env | cut -d '=' -f2)
```

### Useful MySQL Commands

#### Show all tables
```sql
SHOW TABLES;
```

#### View table structure
```sql
DESCRIBE users;
-- OR
SHOW COLUMNS FROM users;
```

#### View all data from a table
```sql
SELECT * FROM users;
```

#### View specific columns
```sql
SELECT id, name, email, role FROM users;
```

#### Count rows
```sql
SELECT COUNT(*) FROM users;
```

#### View with conditions
```sql
-- Users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Products in stock
SELECT * FROM products WHERE in_stock = 1;

-- Recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

#### Exit MySQL
```sql
EXIT;
```

## Method 3: Quick One-Line Commands

### View all users
```bash
mysql -u root -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -D $(grep DB_NAME .env | cut -d '=' -f2) -e "SELECT * FROM users;" 2>/dev/null
```

### View users with roles
```bash
mysql -u root -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -D $(grep DB_NAME .env | cut -d '=' -f2) -e "SELECT name, email, role FROM users;" 2>/dev/null
```

### View all products
```bash
mysql -u root -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -D $(grep DB_NAME .env | cut -d '=' -f2) -e "SELECT id, name, price, in_stock FROM products;" 2>/dev/null
```

### Count rows in each table
```bash
mysql -u root -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -D $(grep DB_NAME .env | cut -d '=' -f2) -e "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'products', COUNT(*) FROM products UNION SELECT 'orders', COUNT(*) FROM orders UNION SELECT 'cart', COUNT(*) FROM cart;" 2>/dev/null
```

## Method 4: Using MySQL Workbench (GUI)

If you have MySQL Workbench installed:

1. Open MySQL Workbench
2. Create a new connection:
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: (from your `.env` file)
   - Default Schema: `tshirtify_db`
3. Connect and browse tables in the left sidebar
4. Double-click any table to view data
5. Use the SQL editor to run queries

## Method 5: Using API Endpoints

If your backend server is running, you can also check data via API:

### View all products
```bash
curl http://localhost:3001/api/products | jq
```

### View a specific product
```bash
curl http://localhost:3001/api/products/1 | jq
```

### Search products
```bash
curl "http://localhost:3001/api/products/search?q=rock" | jq
```

## Common Queries

### Check user roles distribution
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### View products with author names
```sql
SELECT p.id, p.name, p.price, u.name as author_name, p.in_stock
FROM products p
LEFT JOIN users u ON p.author_id = u.id;
```

### View cart items with product details
```sql
SELECT c.id, u.name as user_name, p.name as product_name, c.quantity, c.size
FROM cart c
JOIN users u ON c.user_id = u.id
JOIN products p ON c.product_id = p.id;
```

### View orders with user details
```sql
SELECT o.id, u.name as customer_name, o.total_amount, o.status, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;
```

### Check product sales
```sql
SELECT 
  p.name,
  p.quantity_sold,
  p.total_revenue,
  p.in_stock
FROM products p
ORDER BY p.quantity_sold DESC;
```

## Tips

1. **Use the view script** (`npm run view-db`) for a quick overview
2. **Use MySQL command line** for specific queries
3. **Use MySQL Workbench** for visual browsing
4. **Use API endpoints** to test your application's data access

## Troubleshooting

### Can't connect to MySQL?
- Make sure MySQL is running: `mysql.server start` or `brew services start mysql`
- Check your `.env` file for correct credentials
- Verify database exists: `SHOW DATABASES;`

### Password issues?
- Check your `.env` file: `DB_PASSWORD=your_password`
- Try connecting interactively: `mysql -u root -p`

### Database not found?
- Run setup: `npm run setup-db`
- Check database name in `.env`: `DB_NAME=tshirtify_db`


