import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_STORAGE_KEY = 'tshirtify_cart';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper functions for localStorage
const getLocalCart = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : { items: [], subtotal: 0, total: 0 };
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return { items: [], subtotal: 0, total: 0 };
  }
};

const saveLocalCart = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Load cart on mount and when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      // User is logged in - load from server and merge with localStorage
      mergeCarts();
    } else {
      // User is not logged in - load from localStorage
      const localCart = getLocalCart();
      setCart(localCart);
    }
  }, [isAuthenticated]);

  // Merge localStorage cart with server cart when user logs in
  const mergeCarts = async () => {
    try {
      setLoading(true);
      const localCart = getLocalCart();
      
      // Load server cart
      const serverCart = await cartAPI.getCart();
      
      // If there are items in localStorage, merge them
      if (localCart.items.length > 0) {
        // Add localStorage items to server cart
        for (const localItem of localCart.items) {
          try {
            await cartAPI.addToCart(localItem.product_id, localItem.quantity, localItem.size);
          } catch (error) {
            console.error('Error merging cart item:', error);
          }
        }
        // Clear localStorage cart after merging
        localStorage.removeItem(CART_STORAGE_KEY);
        // Reload server cart
        await loadCart();
      } else {
        // No local items, just use server cart
        setCart(serverCart);
      }
    } catch (error) {
      console.error('Error merging carts:', error);
      // Fallback to localStorage if server fails
      const localCart = getLocalCart();
      setCart(localCart);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!isAuthenticated) {
      // Load from localStorage
      const localCart = getLocalCart();
      setCart(localCart);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.getCart();
      setCart(response);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, size, productData = null) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // User is logged in - save to server
        await cartAPI.addToCart(productId, quantity, size);
        await loadCart();
      } else {
        // User is not logged in - save to localStorage
        const localCart = getLocalCart();
        const existingItemIndex = localCart.items.findIndex(
          item => item.product_id === productId && item.size === size
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          localCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item - need product data for price and name
          if (!productData) {
            setError('Product data is required');
            return { success: false, error: 'Product data is required' };
          }
          
          localCart.items.push({
            id: `local_${Date.now()}_${Math.random()}`,
            product_id: productId,
            quantity,
            size,
            price: productData.price,
            name: productData.name,
            design_url: productData.design_url,
            design_position: productData.design_position
          });
        }

        // Recalculate subtotal
        localCart.subtotal = calculateSubtotal(localCart.items);
        localCart.total = localCart.subtotal;

        setCart(localCart);
        saveLocalCart(localCart);
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartId, quantity, size) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // User is logged in - update on server
        await cartAPI.updateCartItem(cartId, quantity, size);
        await loadCart();
      } else {
        // User is not logged in - update in localStorage
        const localCart = getLocalCart();
        const itemIndex = localCart.items.findIndex(item => item.id === cartId);

        if (itemIndex >= 0) {
          if (quantity !== undefined) {
            localCart.items[itemIndex].quantity = quantity;
          }
          if (size !== undefined) {
            localCart.items[itemIndex].size = size;
          }

          // Recalculate subtotal
          localCart.subtotal = calculateSubtotal(localCart.items);
          localCart.total = localCart.subtotal;

          setCart(localCart);
          saveLocalCart(localCart);
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update cart item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // User is logged in - remove from server
        await cartAPI.removeFromCart(cartId);
        await loadCart();
      } else {
        // User is not logged in - remove from localStorage
        const localCart = getLocalCart();
        localCart.items = localCart.items.filter(item => item.id !== cartId);

        // Recalculate subtotal
        localCart.subtotal = calculateSubtotal(localCart.items);
        localCart.total = localCart.subtotal;

        setCart(localCart);
        saveLocalCart(localCart);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // User is logged in - clear on server
        await cartAPI.clearCart();
      } else {
        // User is not logged in - clear localStorage
        localStorage.removeItem(CART_STORAGE_KEY);
      }

      setCart({ items: [], subtotal: 0, total: 0 });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItemById = (productId, size) => {
    return cart.items.find(item => item.product_id === productId && item.size === size);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemCount,
    getCartItemById,
    clearError,
    isCartEmpty: cart.items.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 