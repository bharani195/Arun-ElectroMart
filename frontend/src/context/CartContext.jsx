import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ items: [], totalAmount: 0 });
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/cart');
            setCart(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const { data } = await api.post('/cart/add', { productId, quantity });
            setCart(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const { data } = await api.put(`/cart/update/${itemId}`, { quantity });
            setCart(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const { data } = await api.delete(`/cart/remove/${itemId}`);
            setCart(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart/clear');
            setCart({ items: [], totalAmount: 0 });
        } catch (error) {
            throw error;
        }
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        cartItemsCount: cart.items?.length || 0,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export default CartContext;
