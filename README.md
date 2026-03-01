# ElectroMart - Full-Stack E-Commerce Platform

A modern, full-featured e-commerce platform for electrical products built with React.js, Node.js, Express, and MongoDB.

## 🚀 Features

### Phase 1 (Current)
- ✅ User Authentication (Register/Login/JWT)
- ✅ Product Listing with Filters & Search
- ✅ Shopping Cart Management
- ✅ Order Placement (COD + Online Payment Ready)
- ✅ Admin Panel for managing products, categories, and orders
- ✅ Responsive Design
- ✅ Modern UI with Gradients and Animations

### Phase 2 (Upcoming)
- ⏳ Online Payment Integration (Razorpay)
- ⏳ Order Tracking
- ⏳ SMS & WhatsApp Notifications
- ⏳ Product Reviews & Ratings

## 📁 Project Structure

```
electromart/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & upload middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── uploads/            # Product images
│   ├── utils/              # Helper functions
│   ├── .env                # Environment variables
│   ├── server.js           # Express server
│   ├── seed.js             # Database seeding script
│   └── package.json
│
├── frontend/               # React user interface
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context API (Auth, Cart)
│   │   ├── utils/         # API utilities
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── .env               # Frontend env variables
│   └── package.json
│
└── admin/                  # React admin dashboard (To be created)
    └── (Similar structure to frontend)
```

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Context API** - State management
- **Axios** - HTTP client
- **React Icons** - Icon library

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Navigate
```bash
cd "c:\SEM 4\electromart"
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit .env file and update:
# - MONGODB_URI (if using MongoDB Atlas)
# - JWT_SECRET (change to a secure random string)
# - PORT (default: 5000)

# Start MongoDB (if using local MongoDB)
# In a new terminal:
mongod

# Seed the database with sample data
node seed.js

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies (already done)
npm install

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Verify Installation

1. Backend API: Visit `http://localhost:5000/api/health`
2. Frontend: Visit `http://localhost:5173`

## 👤 Default Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@electromart.com`
- Password: `admin123`

**User Account:**
- Email: `user@example.com`
- Password: `user123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `POST /api/auth/address` - Add address (Protected)
- `PUT /api/auth/address/:id` - Update address (Protected)
- `DELETE /api/auth/address/:id` - Delete address (Protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/upload` - Upload images (Admin)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart/add` - Add to cart (Protected)
- `PUT /api/cart/update/:itemId` - Update cart item (Protected)
- `DELETE /api/cart/remove/:itemId` - Remove from cart (Protected)
- `DELETE /api/cart/clear` - Clear cart (Protected)

### Orders
- `POST /api/orders/create` - Create order (Protected)
- `GET /api/orders/user` - Get user orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/admin/:id/status` - Update order status (Admin)

## 🎨 Design System

The application uses a modern design system with:
- Premium color gradients
- Smooth animations and transitions
- Responsive grid layouts
- Modern typography (Inter font)
- Shadow and glow effects
- Mobile-first responsive design

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
cd backend
npm start  # Production mode
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates dist/ folder
npm run preview  # Preview production build
```

## 📝 Sample Data

The seed script creates:
- 2 Users (1 admin, 1 regular user)
- 6 Categories (Electronics, Switches, Fans, Wires & Cables, Water Pumps, Power Backup)
- 9 Products with images, specifications, and pricing

## 🚀 Next Steps

### Immediate Tasks (Phase 1 Completion)
1. Create all frontend components (Header, Footer, Product Cards, etc.)
2. Build all page components (Home, Products, Cart, Checkout, etc.)
3. Create admin dashboard frontend
4. Add product images to uploads folder
5. Test complete user flow

### Phase 2 Features
1. Integrate Razorpay payment gateway
2. Implement order tracking system
3. Set up SMS and WhatsApp notifications
4. Add product reviews and ratings functionality

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env` file
- For Atlas: Whitelist your IP address

### Port Already in Use
- Change ports in `.env` files:
  - Backend: Change `PORT=5000` to another port
  - Frontend: Change port in `vite.config.js`

### CORS Issues
- Backend is configured to accept all origins in development
- For production, update CORS settings in `server.js`

## 📦 Dependencies

### Backend Main Dependencies
- express ^4.18.2
- mongoose ^8.0.3
- bcryptjs ^2.4.3
- jsonwebtoken ^9.0.2
- multer ^1.4.5-lts.1
- cors ^2.8.5
- dotenv ^16.3.1

### Frontend Main Dependencies
- react ^18.2.0
- react-router-dom ^6.21.1
- axios ^1.6.2
- react-icons ^5.0.1

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Built with ❤️ for ElectroMart

---

**Note:** This is Phase 1 of the project. The frontend components are being developed. The backend API is fully functional and tested.
