import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  adminLogin: (email, password) =>
    api.post('/auth/admin/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  
  getHot: () => api.get('/products/hot'),
  
  getRecommended: (limit = 12, offset = 0) => api.get('/products/recommended', { params: { limit, offset } }),
  
  getById: (id) => api.get(`/products/${id}`),
  
  search: (query, params = {}) => api.get('/products/search', { params: { q: query, ...params } }),
  
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  
  addToCart: (productId, quantity, size) =>
    api.post('/cart/add', { product_id: productId, quantity, size }),
  
  updateCartItem: (cartId, quantity, size) => {
    const data = { cart_id: cartId };
    if (quantity !== undefined) data.quantity = quantity;
    if (size !== undefined) data.size = size;
    return api.put('/cart/update', data);
  },
  
  removeFromCart: (cartId) => api.delete(`/cart/remove/${cartId}`),
  
  clearCart: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData, paymentMethod) => {
    // Support both old format (shippingAddress, paymentMethod) and new format (object)
    if (typeof orderData === 'string') {
      // Old format for backward compatibility
      return api.post('/orders', { 
        shipping_address: orderData, 
        payment_method: paymentMethod || 'credit_card' 
      });
    }
    // New format - pass object directly
    return api.post('/orders', orderData);
  },
  
  getUserOrders: () => api.get('/orders'),
  
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  
  getAllOrders: (params = {}) => api.get('/orders/admin/all', { params }),
  
  updateOrderStatus: (id, status, paymentStatus) =>
    api.put(`/orders/${id}/status`, { status, payment_status: paymentStatus }),
  
  getOrderStats: () => api.get('/orders/admin/stats'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getMyProducts: () => api.get('/admin/my-products'),
  
  getProductAnalytics: (id) => api.get(`/admin/product/${id}/analytics`),
  
  getSalesReport: (year, month) => 
    api.get('/admin/sales-report', { params: { year, month } }),
  
  getCustomerAnalytics: () => api.get('/admin/customer-analytics'),
};

// Designers API
export const designersAPI = {
  getDesigner: (id) => api.get(`/designers/${id}`),
  
  updateDesignerProfile: (id, profileData, bannerFile) => {
    const formData = new FormData();
    if (profileData.description !== undefined) {
      formData.append('description', profileData.description);
    }
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }
    return api.put(`/designers/${id}/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default api; 