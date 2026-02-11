import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Manufacturer SKU API Client
 * Handles all CRUD operations for manufacturer SKUs
 */
const manufacturerAPI = {
    /**
     * Get all manufacturer SKUs with optional filters
     * @param {Object} filters - { category, isApproved, isActive, search }
     */
    getAll: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.isApproved !== undefined) params.append('isApproved', filters.isApproved);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(
                `${API_URL}/catalog/manufacturers?${params.toString()}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch manufacturer SKUs' };
        }
    },

    /**
     * Get single manufacturer SKU by ID
     * @param {string} id - Manufacturer SKU ID
     */
    getById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/catalog/manufacturers/${id}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch manufacturer SKU' };
        }
    },

    /**
     * Create new manufacturer SKU
     * @param {Object} data - Manufacturer SKU data
     */
    create: async (data) => {
        try {
            const response = await axios.post(
                `${API_URL}/catalog/manufacturers`,
                data,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create manufacturer SKU' };
        }
    },

    /**
     * Update existing manufacturer SKU
     * @param {string} id - Manufacturer SKU ID
     * @param {Object} data - Updated data
     */
    update: async (id, data) => {
        try {
            const response = await axios.put(
                `${API_URL}/catalog/manufacturers/${id}`,
                data,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update manufacturer SKU' };
        }
    },

    /**
     * Delete manufacturer SKU
     * @param {string} id - Manufacturer SKU ID
     */
    delete: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/catalog/manufacturers/${id}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete manufacturer SKU' };
        }
    },

    /**
     * Approve manufacturer SKU
     * @param {string} id - Manufacturer SKU ID
     */
    approve: async (id) => {
        try {
            const response = await axios.patch(
                `${API_URL}/catalog/manufacturers/${id}`,
                { isApproved: true },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to approve manufacturer SKU' };
        }
    },

    /**
     * Reject manufacturer SKU
     * @param {string} id - Manufacturer SKU ID
     */
    reject: async (id) => {
        try {
            const response = await axios.patch(
                `${API_URL}/catalog/manufacturers/${id}`,
                { isApproved: false },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to reject manufacturer SKU' };
        }
    },

    /**
     * Toggle active status
     * @param {string} id - Manufacturer SKU ID
     * @param {boolean} isActive - New active status
     */
    toggleActive: async (id, isActive) => {
        try {
            const response = await axios.patch(
                `${API_URL}/catalog/manufacturers/${id}`,
                { isActive },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update status' };
        }
    },

    /**
     * Get statistics
     */
    getStats: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/catalog/manufacturers/stats`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            // Fallback: calculate stats from all SKUs
            const allSKUs = await manufacturerAPI.getAll();
            const data = allSKUs.data || [];

            return {
                success: true,
                data: {
                    total: data.length,
                    pending: data.filter(sku => !sku.isApproved).length,
                    approved: data.filter(sku => sku.isApproved).length,
                    active: data.filter(sku => sku.isActive).length,
                    inactive: data.filter(sku => !sku.isActive).length,
                }
            };
        }
    },
};

export default manufacturerAPI;
