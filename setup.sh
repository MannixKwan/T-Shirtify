#!/bin/bash

echo "🚀 Setting up T-Shirtify E-commerce Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Node.js and MySQL are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client && npm install && cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your database credentials"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/designs

echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your database credentials"
echo "2. Create a MySQL database named 'tshirtify_db'"
echo "3. Run 'npm run setup-db' to create database tables"
echo "4. Run 'npm run dev' to start the development servers"
echo ""
echo "Default admin credentials:"
echo "Email: admin@tshirtify.com"
echo "Password: admin123" 