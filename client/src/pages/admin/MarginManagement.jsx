import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function MarginManagement() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMargin, setEditingMargin] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

    const { data: margins, isLoading } = useQuery({
        queryKey: ['admin-margins'],
        queryFn: adminAPI.getMargins,
    });

    const createMutation = useMutation({
        mutationFn: adminAPI.createMargin,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-margins']);
            toast.success('Margin protocol established');
            handleCloseModal();
        },
        onError: (err) => toast.error(err.message || 'Protocol failure')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminAPI.updateMargin(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-margins']);
            toast.success('Margin protocol updated');
            handleCloseModal();
        },
        onError: (err) => toast.error(err.message || 'Update failure')
    });

    const deleteMutation = useMutation({
        mutationFn: adminAPI.deleteMargin,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-margins']);
            toast.success('Margin protocol decommissioned');
            setConfirmDelete({ isOpen: false, id: null });
        },
        onError: (err) => toast.error(err.message || 'Deletion failure')
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        applicationType: 'Global',
        category: 'All',
        material: '',
        priceRange: { min: 0, max: 0 },
        marginType: 'Percentage',
        marginValue: 0,
        priority: 0,
        isActive: true
    });

    const handleOpenModal = (margin = null) => {
        if (margin) {
            setEditingMargin(margin);
            setFormData({
                name: margin.name,
                description: margin.description || '',
                applicationType: margin.applicationType,
                category: margin.category || 'All',
                material: margin.material || '',
                priceRange: margin.priceRange || { min: 0, max: 0 },
                marginType: margin.marginType,
                marginValue: margin.marginValue,
                priority: margin.priority || 0,
                isActive: margin.isActive
            });
        } else {
            setEditingMargin(null);
            setFormData({
                name: '',
                description: '',
                applicationType: 'Global',
                category: 'All',
                material: '',
                priceRange: { min: 0, max: 0 },
                marginType: 'Percentage',
                marginValue: 0,
                priority: 0,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMargin(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMargin) {
            updateMutation.mutate({ id: editingMargin._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const toggleStatus = (margin) => {
        updateMutation.mutate({
            id: margin._id,
            data: { ...margin, isActive: !margin.isActive }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">System Margins</h2>
                    <p className="text-sm text-gray-500">Manage pricing overrides and commission rates.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all active:scale-95"
                >
                    + Configure New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 animate-pulse h-48"></div>
                    ))
                ) : margins?.data?.length > 0 ? (
                    margins.data.map((margin) => (
                        <div key={margin._id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 flex gap-2">
                                <button
                                    onClick={() => toggleStatus(margin)}
                                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-widest border transition-all ${margin.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                >
                                    {margin.isActive ? 'Active' : 'Disabled'}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete({ isOpen: true, id: margin._id })}
                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            <h3 className="font-black text-gray-900 mb-6 text-lg tracking-tight group-hover:text-primary-600 transition-colors">{margin.name}</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                                    <span className="font-bold text-gray-700 text-[10px] bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 capitalize">{margin.applicationType}</span>
                                </div>
                                <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rate</span>
                                    <span className="font-black text-primary-600 text-2xl italic tracking-tighter">
                                        {margin.marginType === 'Percentage'
                                            ? `${margin.marginValue}%`
                                            : `₹${margin.marginValue.toLocaleString()}`}
                                    </span>
                                </div>
                                {margin.applicationType === 'Category' && (
                                    <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Scope</span>
                                        <span className="font-bold text-gray-700 text-[10px] bg-primary-50 text-primary-700 px-3 py-1 rounded-lg">{margin.category}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleOpenModal(margin)}
                                className="mt-8 w-full py-2.5 border-t border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-600 transition-colors text-center"
                            >
                                Edit Protocol
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-20 rounded-3xl shadow-sm border border-gray-200 text-center text-gray-500">
                        <span className="text-4xl mb-4 block opacity-50">💰</span>
                        <p className="font-black uppercase tracking-widest text-gray-300">No margin configurations found</p>
                    </div>
                )}
            </div>

            {/* Config Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden animate-slideUp">
                        <form onSubmit={handleSubmit}>
                            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">
                                        {editingMargin ? 'Edit Margin Protocol' : 'New Margin Protocol'}
                                    </h3>
                                    <p className="text-[10px] font-black text-primary-600 tracking-widest uppercase opacity-70">
                                        {editingMargin ? `Protocol ID: ${editingMargin._id}` : 'Establish system pricing rule'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Rule Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                                            placeholder="e.g., Diwali Special Category Margin"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Application Hub</label>
                                        <select
                                            value={formData.applicationType}
                                            onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                                        >
                                            <option value="Global">Global Overwrite</option>
                                            <option value="Category">Category Specific</option>
                                            <option value="Material">Material Specific</option>
                                            <option value="PriceRange">Price Range</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Margin Protocol</label>
                                        <select
                                            value={formData.marginType}
                                            onChange={(e) => setFormData({ ...formData, marginType: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                                        >
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>

                                    {formData.applicationType === 'Category' && (
                                        <div className="col-span-2 animate-in fade-in slide-in-from-left-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Target Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-primary-50/50 border border-primary-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                                            >
                                                <option value="All">All Categories</option>
                                                <option value="Ring">Rings</option>
                                                <option value="Necklace">Necklaces</option>
                                                <option value="Earring">Earrings</option>
                                                <option value="Bracelet">Bracelets</option>
                                                <option value="Pendant">Pendants</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-2 bg-primary-50/30 p-8 rounded-3xl border border-primary-100/50">
                                        <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 text-center">Protocol Value</label>
                                        <div className="flex items-center justify-center gap-4">
                                            {formData.marginType === 'Fixed' && <span className="text-3xl font-black text-primary-300 italic">₹</span>}
                                            <input
                                                required
                                                type="number"
                                                value={formData.marginValue}
                                                onChange={(e) => setFormData({ ...formData, marginValue: parseFloat(e.target.value) })}
                                                className="w-40 bg-white border border-primary-200 rounded-2xl px-6 py-6 text-4xl font-black text-center text-primary-600 outline-none shadow-xl shadow-primary-50"
                                            />
                                            {formData.marginType === 'Percentage' && <span className="text-3xl font-black text-primary-300 italic">%</span>}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Execution Priority (0-100)</label>
                                        <input
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                                        />
                                        <p className="text-[9px] text-gray-400 mt-2 px-1 font-bold italic">* Higher priority protocols override lower ones in overlapping sectors.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-gray-50 flex justify-end gap-4 bg-gray-50/30">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="px-10 py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {editingMargin ? 'Update Protocol' : 'Establish Protocol'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
                title="Decommission Protocol?"
                message="This will permanently revoke the pricing margin protocol from the system archive. This action is irreversible."
                confirmText="Terminate Protocol"
            />
        </div>
    );
}
