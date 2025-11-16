# T-Shirtify - E-commerce Platform

A comprehensive T-shirt e-commerce platform built with React frontend, Node.js backend, and MySQL database.

## Features

### Customer Features
- **Homepage**: Jumbotron, product carousel, and recommended T-shirts
- **Product Pages**: Detailed product view with size/quantity selection
- **Shopping Cart**: Cart management with total calculations
- **User Authentication**: Customer login and registration
- **Responsive Design**: Mobile, tablet, and desktop optimized

### Admin Features
- **Design Upload**: Drag & drop design upload with T-shirt overlay
- **Design Editor**: Resize, reposition, and customize designs
- **Pricing Management**: Set product prices and view profit analytics
- **Sales Analytics**: Track sales performance and earnings

## Tech Stack

- **Frontend**: React, React Router, Axios, Styled Components
- **Backend**: Node.js, Express.js, MySQL
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **Design Editor**: Fabric.js

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd T-Shirtify
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Database Setup**
   - Create a MySQL database
   - Copy `.env.example` to `.env` and configure your database credentials
   - Run database setup:
   ```bash
   npm run setup-db
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
T-Shirtify/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── admin/         # Admin interface
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── database/          # Database setup and models
│   ├── middleware/        # Custom middleware
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads
│   └── utils/            # Utility functions
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/admin` - Get all orders (admin only)

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=tshirtify_db
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 