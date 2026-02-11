import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import manufacturerAPI from '../../api/manufacturer';

export default function ManufacturerTabContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [approvalFilter, setApprovalFilter] = useState('');

    // Build filters object
    const filters = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (statusFilter) filters.isActive = statusFilter === 'active';
    if (approvalFilter) filters.isApproved = approvalFilter === 'approved';
    if (searchTerm) filters.search = searchTerm;

    // Fetch manufacturer SKUs
    const { data: skusResponse, isLoading } = useQuery({
        queryKey: ['manufacturer-skus', filters],
        queryFn: () => manufacturerAPI.getAll(filters),
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (id) => manufacturerAPI.approve(id),
        onSuccess: () => {
            toast.success('SKU approved successfully!');
            queryClient.invalidateQueries(['manufacturer-skus']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to approve SKU');
        },
    });

    // Toggle active mutation
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }) => manufacturerAPI.toggleActive(id, isActive),
        onSuccess: () => {
            toast.success('SKU status updated!');
            queryClient.invalidateQueries(['manufacturer-skus']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update SKU');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => manufacturerAPI.delete(id),
        onSuccess: () => {
            toast.success('SKU deleted successfully!');
            queryClient.invalidateQueries(['manufacturer-skus']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete SKU');
        },
    });

    const skus = skusResponse?.data || [];

    if (isLoading) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading manufacturer SKUs...</p>
            </div>
        );
    }

    return (
        <>
            {/* Action Bar */}
            <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-[#D4AF37]/10 p-8 mb-8 shadow-xl shadow-black/5">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {/* Search */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search by SKU or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] focus:outline-none focus:border-[#D4AF37]/30 transition-all shadow-sm group-hover:shadow-md"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-hover:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]/30 transition-all shadow-sm hover:shadow-md cursor-pointer hex-select"
                        >
                            <option value="">All Categories</option>
                            <option value="Ring">Ring</option>
                            <option value="Necklace">Necklace</option>
                            <option value="Earring">Earring</option>
                            <option value="Bracelet">Bracelet</option>
                            <option value="Pendant">Pendant</option>
                            <option value="Brooch">Brooch</option>
                            <option value="Other">Other</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]/30 transition-all shadow-sm hover:shadow-md cursor-pointer hex-select"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Approval Filter */}
                        <select
                            value={approvalFilter}
                            onChange={(e) => setApprovalFilter(e.target.value)}
                            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]/30 transition-all shadow-sm hover:shadow-md cursor-pointer hex-select"
                        >
                            <option value="">All Approval</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <button
                        onClick={() => navigate('/sourcing/manufacturers/add')}
                        className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-[0_15px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New SKU
                    </button>
                </div>
            </div>

            {/* SKU Table */}
            {skus.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-[#D4AF37]/10 p-20 text-center shadow-xl shadow-black/5">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37]/10 to-[#B8941F]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>No SKUs Registered</h3>
                    <p className="text-gray-500 mb-10 max-w-md mx-auto italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Begin your manufacturer registry by adding your first premium jewelry SKU to the centralized ledger.</p>
                    <button
                        onClick={() => navigate('/sourcing/manufacturers/add')}
                        className="px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.5)] transition-all"
                    >
                        Initialize First SKU
                    </button>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-[#D4AF37]/10 shadow-2xl shadow-black/10 overflow-hidden">
                    <table className="min-w-full divide-y divide-[#D4AF37]/10">
                        <thead className="bg-[#1A1A1A]">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">SKU ID</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Product details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Category</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Base Cost</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">MOQ</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Lead Time</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Approval status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {skus.map((sku) => (
                                <tr key={sku._id} className="hover:bg-[#D4AF37]/[0.02] transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-[13px] font-bold text-[#1A1A1A] tracking-wider font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{sku.internalSKU}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            {sku.imageUrl ? (
                                                <img src={sku.imageUrl} alt={sku.name} className="w-16 h-16 rounded-2xl object-cover border border-[#D4AF37]/10 shadow-sm" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[17px] font-bold text-[#1A1A1A] tracking-tight mb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>{sku.name}</p>
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">{sku.supplierName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-[12px] font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">{sku.category}</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-bold text-[#1A1A1A]">₹{sku.baseCost?.toLocaleString()}</span>
                                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-0.5">Base Registry Cost</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-[13px] font-bold text-gray-600">{sku.moq} <span className="text-[9px] font-black text-gray-300 uppercase ml-1">Units</span></span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-[13px] font-bold text-gray-600">{sku.leadTimeDays} <span className="text-[9px] font-black text-gray-300 uppercase ml-1">Days</span></span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-2">
                                            <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sku.isApproved ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                {sku.isApproved ? '✓ Approved' : '⏳ Pending'}
                                            </span>
                                            <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sku.isActive ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                                {sku.isActive ? '🟢 Active' : '🔴 Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!sku.isApproved && (
                                                <button
                                                    onClick={() => approveMutation.mutate(sku._id)}
                                                    className="w-10 h-10 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-xl border border-transparent hover:border-green-100 transition-all shadow-sm hover:shadow active:scale-95"
                                                    title="Approve SKU"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleActiveMutation.mutate({ id: sku._id, isActive: !sku.isActive })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-transparent transition-all shadow-sm hover:shadow active:scale-95 ${sku.isActive
                                                    ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-100'
                                                    : 'text-blue-600 hover:bg-blue-50 hover:border-blue-100'
                                                    }`}
                                                title={sku.isActive ? 'Deactivate SKU' : 'Activate SKU'}
                                            >
                                                {sku.isActive ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.802v4.396a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/sourcing/manufacturers/edit/${sku._id}`)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-sm hover:shadow active:scale-95"
                                                title="Edit SKU"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this SKU? This action cannot be undone.')) {
                                                        deleteMutation.mutate(sku._id);
                                                    }
                                                }}
                                                className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all shadow-sm hover:shadow active:scale-95"
                                                title="Delete SKU"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
