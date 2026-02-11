import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const quotationAPI = {
    // Get all quotations with optional filters
    getAll: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/quotations`, {
            params: filters,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Get quotation by ID
    getById: async (id) => {
        const response = await axios.get(`${API_URL}/quotations/${id}`, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Get quotation by Cart ID
    getByCartId: async (cartId) => {
        const response = await axios.get(`${API_URL}/quotations/cart/${cartId}`, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Approve quotation
    approve: async (id) => {
        const response = await axios.put(`${API_URL}/quotations/${id}/approve`, {}, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Reject quotation
    reject: async (id, reason) => {
        const response = await axios.put(`${API_URL}/quotations/${id}/reject`, { reason }, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Generate quotation (Admin/Sales only)
    generate: async (cartId) => {
        const response = await axios.post(`${API_URL}/quotations/generate`, { cartId }, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Revise quotation (Admin/Sales only)
    revise: async (id, changes) => {
        const response = await axios.put(`${API_URL}/quotations/${id}/revise`, { changes }, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Send quotation (Admin/Sales only)
    send: async (id) => {
        const response = await axios.put(`${API_URL}/quotations/${id}/send`, {}, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    // Download PDF
    downloadPdf: async (id) => {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/quotations/${id}/download?token=${token}`;
        window.open(url, '_blank');
    }
};

export default quotationAPI;
