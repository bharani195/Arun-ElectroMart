import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <App />
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
