import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Image API
export const imageAPI = {
    upload: (formData) => api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getSession: (id) => api.get(`/images/session/${id}`),
    deleteSession: (id) => api.delete(`/images/session/${id}`),
};

// Recommendation API
export const recommendationAPI = {
    generate: (sessionId) => api.post('/recommendations/generate', { sessionId }),
    getById: (id) => api.get(`/recommendations/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    getHistory: () => api.get('/cart/history'),
    addItem: (data) => api.post('/cart/items', data),
    removeItem: (id) => api.delete(`/cart/items/${id}`),
    updateItem: (id, data) => api.put(`/cart/items/${id}`, data),
    submit: () => api.post('/cart/submit'),
    cancelCart: (cartId) => api.post(`/cart/${cartId}/cancel`),
    getAll: (params) => api.get('/cart/all', { params }),
    getById: (id) => api.get(`/cart/${id}`),
    assign: (id, data) => api.put(`/cart/${id}/assign`, data),
    addNote: (id, data) => api.post(`/cart/${id}/notes`, data),
    updateItemStatus: (cartId, itemId, data) => api.put(`/cart/${cartId}/items/${itemId}/status`, data),
    approveAll: (cartId) => api.put(`/cart/${cartId}/approve-all`),
    approve: (cartId) => api.put(`/cart/${cartId}/approve`),
};

// Quotation API
export const quotationAPI = {
    getAll: (params) => api.get('/quotations', { params }),
    generate: (data) => api.post('/quotations/generate', data),
    getByCart: (cartId) => api.get(`/quotations/cart/${cartId}`),
    send: (id) => api.put(`/quotations/${id}/send`),
    revise: (id, data) => api.put(`/quotations/${id}/revise`, data),
    approve: (id) => api.put(`/quotations/${id}/approve`),
    reject: (id, data) => api.put(`/quotations/${id}/reject`, data),
    downloadPdf: (id) => {
        const token = localStorage.getItem('token');
        window.open(`/api/quotations/${id}/download?token=${token}`, '_blank');
    },
};

// Catalog API
export const catalogAPI = {
    searchInventory: (params) => api.get('/catalog/inventory', { params }),
    getInventoryItem: (id) => api.get(`/catalog/inventory/${id}`),
    addInventory: (data) => api.post('/catalog/inventory', data),
    updateInventory: (id, data) => api.put(`/catalog/inventory/${id}`, data),
    deleteInventory: (id) => api.delete(`/catalog/inventory/${id}`),
    getManufacturers: (params) => api.get('/catalog/manufacturers', { params }),
    addManufacturer: (data) => api.post('/catalog/manufacturers', data),
    updateManufacturer: (id, data) => api.put(`/catalog/manufacturers/${id}`, data),
    approveManufacturer: (id) => api.put(`/catalog/manufacturers/${id}/approve`),
};

// Admin API
export const adminAPI = {
    getMargins: () => api.get('/admin/margins'),
    createMargin: (data) => api.post('/admin/margins', data),
    updateMargin: (id, data) => api.put(`/admin/margins/${id}`, data),
    deleteMargin: (id) => api.delete(`/admin/margins/${id}`),
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
    getStats: () => api.get('/admin/stats'),
    getSettings: () => api.get('/admin/settings'),
    updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { value }),
    getEmailTemplates: () => api.get('/admin/email-templates'),
    updateEmailTemplate: async (id, data) => {
        const response = await api.put(`/admin/email-templates/${id}`, data);
        return response.data;
    },
};

export const messageAPI = {
    getConversation: async (contextType, contextId) => {
        const response = await api.get(`/messages/${contextType}/${contextId}`);
        return response.data;
    },
    sendMessage: async (data) => {
        const response = await api.post('/messages', data);
        return response.data;
    },
    markAsRead: async (contextType, contextId) => {
        const response = await api.put(`/messages/${contextType}/${contextId}/read`);
        return response.data;
    },
};

export default api;
