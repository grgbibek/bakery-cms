import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Add a request interceptor to automatically attach the token to all requests
api.interceptors.request.use(
  (config) => {
    const isRiderPage = window.location.pathname.startsWith('/rider');
    const token = isRiderPage 
      ? (localStorage.getItem('riderToken') || localStorage.getItem('adminToken'))
      : (localStorage.getItem('adminToken') || localStorage.getItem('riderToken'));
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry / unauthorized access globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('adminToken');
      localStorage.removeItem('riderToken');
      // Force redirect if currently on restricted page
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      } else if (window.location.pathname.startsWith('/rider') && window.location.pathname !== '/rider/login') {
        window.location.href = '/rider/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const productService = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const contentService = {
  getContent: () => api.get('/content'),
  updateContent: (data) => api.post('/content', data),
};

export const settingService = {
  getSettings: () => api.get('/settings'),
  updateSetting: (key, value) => api.post('/settings/update', { key, value }),
};

export const orderService = {
  createOrder: (orderPayload) => api.post('/orders', orderPayload),
  getOrders: () => api.get('/orders'),
  getOrderStats: () => api.get('/orders/stats'),
  trackOrder: (trackingId) => api.get(`/orders/track/${trackingId}`),
  updateOrderStatus: (id, status, notes) => api.put(`/orders/${id}/status`, { status, notes }),
  getOrderDetails: (id) => api.get(`/orders/${id}/details`),
  getRiderOrders: () => api.get('/orders/rider'),
  pickOrder: (id) => api.post(`/orders/${id}/pick`),
  uploadPaymentProof: (id, image) => api.post(`/orders/${id}/payment-proof`, { image }),
};

export default api;
