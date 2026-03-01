import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/wishlist');
            setWishlist(data.products || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.post('/wishlist/add', { productId });
            setWishlist(data.products || []);
            return true;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return false;
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.delete(`/wishlist/${productId}`);
            setWishlist(data.products || []);
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return false;
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    const value = {
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
