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
            queryClient.invalidateQueries({ queryKey: ['admin-margins'] });
            toast.success('Margin protocol established');
            handleCloseModal();
        },
        onError: (err) => toast.error(err.message || 'Protocol failure')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminAPI.updateMargin(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-margins'] });
            toast.success('Margin protocol updated');
            handleCloseModal();
        },
        onError: (err) => toast.error(err.message || 'Update failure')
    });

    const deleteMutation = useMutation({
        mutationFn: adminAPI.deleteMargin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-margins'] });
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Top Bar */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>System Margins</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mt-1">Financial protocol configuration and markup logic control</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all active:scale-95 border border-[#D4AF37]/20"
                >
                    + Configure New
                </button>
            </div>

            {/* Margins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-[#D4AF37]/10 animate-pulse h-48"></div>
                    ))
                ) : margins?.data?.length > 0 ? (
                    margins.data.map((margin) => (
                        <div key={margin._id} className="group bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-[#D4AF37]/10 shadow-xl shadow-black/5 hover:shadow-2xl hover:border-[#D4AF37]/40 transition-all duration-500 relative overflow-hidden flex flex-col">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7E7CE]/10 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                            {/* Card Status & Actions */}
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all cursor-pointer ${margin.isActive ? 'bg-green-50 text-green-700 border-green-100 ring-4 ring-green-50/50' : 'bg-gray-50 text-gray-400 border-gray-100 grayscale opacity-60'}`} onClick={() => toggleStatus(margin)}>
                                    {margin.isActive ? 'Active' : 'Disabled'}
                                </span>
                                <button
                                    onClick={() => setConfirmDelete({ isOpen: true, id: margin._id })}
                                    className="p-2 bg-white/50 rounded-xl hover:bg-red-50 hover:text-red-500 text-gray-300 transition-all border border-[#D4AF37]/5 hover:border-red-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-10 relative z-10">
                                <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#D4AF37] transition-colors mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {margin.name}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-mono italic opacity-60">PROTOCOL ID: {margin._id.substring(margin._id.length - 8).toUpperCase()}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                                <div className="bg-[#FAFAF8]/80 p-5 rounded-2xl border border-[#D4AF37]/5 group-hover:bg-white transition-all">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 leading-none">Type</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">{margin.applicationType}</p>
                                </div>
                                <div className="bg-[#FAFAF8]/80 p-5 rounded-2xl border border-[#D4AF37]/5 group-hover:bg-white transition-all">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 leading-none">Rate</p>
                                    <p className="text-xl font-black text-[#D4AF37] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {margin.marginType === 'Percentage'
                                            ? `${margin.marginValue}%`
                                            : `₹${margin.marginValue.toLocaleString()}`}
                                    </p>
                                </div>
                                {margin.applicationType === 'Category' && (
                                    <div className="col-span-2 bg-[#F7E7CE]/10 p-5 rounded-2xl border border-[#D4AF37]/10 group-hover:bg-white transition-all">
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 leading-none">Target Sector</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                                            <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">{margin.category}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleOpenModal(margin)}
                                className="mt-auto w-full py-4 border-t border-[#D4AF37]/10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#D4AF37] transition-all text-center flex items-center justify-center gap-2 group/btn"
                            >
                                Edit Protocol
                                <svg className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-32 text-center bg-white/80 backdrop-blur-md rounded-[3.5rem] border border-[#D4AF37]/10 shadow-2xl">
                        <div className="w-28 h-28 bg-white rounded-[2.5rem] shadow-xl border border-[#D4AF37]/10 flex items-center justify-center mb-10 mx-auto group">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-500">💰</span>
                        </div>
                        <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Empty Portfolio</h2>
                        <p className="text-xl text-gray-400 max-w-sm mx-auto italic leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No margin protocols have been established yet. Initialize a new configuration to begin system financial control.</p>
                    </div>
                )}
            </div>

            {/* Config Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn transition-all">
                    <div className="bg-white rounded-[3rem] shadow-3xl border border-[#D4AF37]/20 w-full max-w-3xl overflow-hidden animate-slideUp relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7E7CE]/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                        <form onSubmit={handleSubmit} className="relative z-10">
                            <div className="p-12 border-b border-[#D4AF37]/10 flex justify-between items-center bg-gradient-to-r from-[#FAFAF8] to-white">
                                <div>
                                    <h3 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {editingMargin ? 'Edit Protocol' : 'New Protocol'}
                                    </h3>
                                    <p className="text-[10px] font-black text-[#D4AF37] tracking-[0.3em] uppercase mt-2">
                                        Financial Logic Configuration Matrix
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="w-14 h-14 bg-white border border-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:border-[#D4AF37]/30 transition-all shadow-sm group"
                                >
                                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-12 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Identity Tag</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-8 py-5 text-lg font-bold text-[#1A1A1A] focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                                            placeholder="e.g., Strategic Premium Markup"
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Sector Scope</label>
                                        <select
                                            value={formData.applicationType}
                                            onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-8 py-5 text-[11px] font-black uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-[#D4AF37]/10 cursor-pointer shadow-sm"
                                        >
                                            <option value="Global">Global Reach</option>
                                            <option value="Category">Category Specific</option>
                                            <option value="Material">Material Specific</option>
                                            <option value="PriceRange">Price Trajectory</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Logic Pattern</label>
                                        <select
                                            value={formData.marginType}
                                            onChange={(e) => setFormData({ ...formData, marginType: e.target.value })}
                                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-8 py-5 text-[11px] font-black uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-[#D4AF37]/10 cursor-pointer shadow-sm"
                                        >
                                            <option value="Percentage">Percentage Calculation</option>
                                            <option value="Fixed">Fixed Asset Value</option>
                                        </select>
                                    </div>

                                    {formData.applicationType === 'Category' && (
                                        <div className="col-span-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Target Classification</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-[#F7E7CE]/20 border border-[#D4AF37]/20 rounded-2xl px-8 py-5 text-[11px] font-black uppercase tracking-widest outline-none shadow-sm"
                                            >
                                                <option value="All">All Classifications</option>
                                                <option value="Ring">Rings Portfolio</option>
                                                <option value="Necklace">Necklace Series</option>
                                                <option value="Earring">Earring Modules</option>
                                                <option value="Bracelet">Bracelet Assets</option>
                                                <option value="Pendant">Pendant Units</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-2 bg-[#F7E7CE]/20 p-12 rounded-[2.5rem] border border-[#D4AF37]/20 shadow-xl shadow-[#D4AF37]/5 relative group overflow-hidden">
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                                        <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-8 text-center italic">Scalar Margin Value</label>
                                        <div className="flex items-center justify-center gap-6 relative z-10">
                                            {formData.marginType === 'Fixed' && <span className="text-5xl font-bold text-[#D4AF37]/40 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>₹</span>}
                                            <input
                                                required
                                                type="number"
                                                value={formData.marginValue}
                                                onChange={(e) => setFormData({ ...formData, marginValue: parseFloat(e.target.value) })}
                                                className="w-48 bg-white border border-[#D4AF37]/30 rounded-[2rem] px-8 py-8 text-6xl font-bold text-center text-[#1A1A1A] outline-none shadow-2xl shadow-[#D4AF37]/10 focus:ring-8 focus:ring-[#F7E7CE]/50 transition-all"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            />
                                            {formData.marginType === 'Percentage' && <span className="text-5xl font-bold text-[#D4AF37]/40 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>%</span>}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-4 px-1">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority Hierarchy</label>
                                            <span className="text-[11px] font-black text-[#D4AF37]">{formData.priority} / 100</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-[#FAFAF8] rounded-lg appearance-none cursor-pointer accent-[#D4AF37] border border-[#D4AF37]/10"
                                        />
                                        <p className="text-[9px] text-gray-400 mt-4 px-1 font-bold italic tracking-wider opacity-60">* Higher priority protocols supersede contradictory markup in overlapping sectors.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 border-t border-[#D4AF37]/10 flex justify-end gap-6 bg-[#FAFAF8]/50">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#1A1A1A] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="px-12 py-5 bg-[#1A1A1A] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[#D4AF37] transition-all shadow-2xl active:scale-95 disabled:opacity-50 ring-offset-2 focus:ring-2 focus:ring-[#D4AF37]"
                                >
                                    {editingMargin ? 'Update Protocol' : 'Apply Matrix'}
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
