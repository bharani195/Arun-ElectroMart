import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import Header from './components/layout/Header';
import CategoryNav from './components/layout/CategoryNav';
import Footer from './components/layout/Footer';
import Chatbot from './components/layout/Chatbot';
import Home from './pages/Home';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivities from './pages/admin/AdminActivities';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminCategories from './pages/admin/AdminCategories';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSupport from './pages/admin/AdminSupport';
import Support from './pages/Support';
import ScrollToTop from './components/common/ScrollToTop';
import { ConfirmProvider } from './components/common/ConfirmDialog';


function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <ConfirmProvider>
            <div className="App">
                <ScrollToTop />
                {/* Only show header, category nav, footer, and chatbot for non-admin routes */}
                {!isAdminRoute && (
                    <>
                        <Header />
                        <CategoryNav />
                    </>
                )}

                <main style={{ minHeight: isAdminRoute ? '100vh' : '100vh' }}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/support" element={<Support />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/products" element={<AdminProducts />} />
                        <Route path="/admin/products/new" element={<AdminProductForm />} />
                        <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
                        <Route path="/admin/categories" element={<AdminCategories />} />
                        <Route path="/admin/orders" element={<AdminOrders />} />
                        <Route path="/admin/reports" element={<AdminReports />} />
                        <Route path="/admin/notifications" element={<AdminNotifications />} />
                        <Route path="/admin/support" element={<AdminSupport />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/activities" element={<AdminActivities />} />
                    </Routes>
                </main>

                {!isAdminRoute && (
                    <>
                        <Footer />
                        <Chatbot />
                    </>
                )}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick={false}
                    closeButton={false}
                    pauseOnHover
                    limit={3}
                />
            </div>
        </ConfirmProvider>
    );
}

export default App;
