import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function InventoryManagement() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Fetch inventory
    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => catalogAPI.searchInventory(),
    });

    const inventory = inventoryData?.data || [];

    // Filter inventory
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => catalogAPI.deleteInventory(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory']);
            toast.success('Inventory asset decommissioned successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Decommissioning failure');
        },
    });

    const handleDelete = (item) => {
        if (window.confirm(`Are you certain you wish to decommission "${item.name}" from the strategic registry?`)) {
            deleteMutation.mutate(item._id);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>Ecosystem Inventory</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mt-1">Universal catalog management and architectural inventory control</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 active:scale-95 transition-all outline-none border border-white/10"
                >
                    + Register Strategic Asset
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group/field">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                            Asset Discovery
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or unique SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-6 py-4 placeholder:text-gray-300 text-sm font-medium outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                            />
                            <svg className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="group/field">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                            Category Filter
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all appearance-none"
                        >
                            <option value="">All Categories</option>
                            <option value="Ring">Rings</option>
                            <option value="Necklace">Necklaces</option>
                            <option value="Earring">Earrings</option>
                            <option value="Bracelet">Bracelets</option>
                            <option value="Pendant">Pendants</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                {isLoading ? (
                    <div className="p-24 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37] mx-auto"></div>
                        <p className="mt-8 text-gray-400 font-black uppercase tracking-widest text-xs">Exhuming registry assets...</p>
                    </div>
                ) : filteredInventory.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="text-6xl mb-6 opacity-20">🔍</div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Inventory Void</h3>
                        <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                            {searchTerm || categoryFilter ? 'No items match your discovery parameters' : 'The registry is currently vacant of assets'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#D4AF37]/10">
                            <thead className="bg-[#F7E7CE]/20">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visual</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Core</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Material</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registry Depth</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interface</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4AF37]/5">
                                {filteredInventory.map((item) => (
                                    <tr key={item._id} className="hover:bg-[#F7E7CE]/10 transition-all group">
                                        <td className="px-6 py-6">
                                            <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#D4AF37]/10 bg-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">💎</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-black text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</div>
                                            <div className="text-[10px] text-gray-400 font-mono italic mt-1 uppercase tracking-tighter opacity-70">{item.sku} <span className="mx-2 opacity-30">|</span> {item.category}</div>
                                        </td>
                                        <td className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <span className="bg-[#FAFAF8] px-3 py-1.5 rounded-xl border border-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-colors">
                                                {item.material?.metal} • {item.material?.purity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="text-sm font-black text-[#1A1A1A]">₹{item.baseCost?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-offset-2 ${item.stockQuantity > 5 ? 'bg-green-100 text-green-700 ring-green-100' :
                                                item.stockQuantity > 0 ? 'bg-[#F7E7CE] text-[#D4AF37] ring-[#F7E7CE]' :
                                                    'bg-red-100 text-red-700 ring-red-100'
                                                }`}>
                                                {item.stockQuantity} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2.5 text-gray-400 hover:text-[#D4AF37] transition-all bg-[#FAFAF8] rounded-xl border border-[#D4AF37]/5 hover:border-[#D4AF37]/30 hover:bg-white"
                                                    title="Modify Asset"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-all bg-[#FAFAF8] rounded-xl border border-red-100 hover:bg-red-50"
                                                    title="Decommission Asset"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Registry Size</p>
                    <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{inventory.length}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-green-100 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-2">Available Assets</p>
                    <p className="text-4xl font-bold text-green-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {inventory.filter(i => i.stockQuantity > 0).length}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-red-100 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <p className="text-[10px] text-red-300 font-black uppercase tracking-widest mb-2">Depleted Reserves</p>
                    <p className="text-4xl font-bold text-red-500" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {inventory.filter(i => i.stockQuantity === 0).length}
                    </p>
                </div>
                <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/10 shadow-3xl relative overflow-hidden group shadow-black/40">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Collective Value</p>
                    <p className="text-3xl font-bold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        ₹{inventory.reduce((sum, i) => sum + (i.baseCost * i.stockQuantity), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <InventoryModal
                    item={editingItem}
                    onClose={() => {
                        setShowModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        queryClient.invalidateQueries(['inventory']);
                        setShowModal(false);
                        setEditingItem(null);
                    }}
                />
            )}
        </div>
    );
}

// Inventory Modal Component
function InventoryModal({ item, onClose, onSuccess }) {
    const [formData, setFormData] = useState(item || {
        sku: '',
        name: '',
        description: '',
        category: 'Ring',
        material: {
            metal: 'Gold',
            purity: '18K',
            weight: 0,
        },
        specifications: {
            size: '',
            shape: '',
            style: '',
            finish: 'Polished',
        },
        images: [],
        baseCost: 0,
        stockQuantity: 0,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: '',
        },
    });

    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (item) {
                return catalogAPI.updateInventory(item._id, data);
            }
            return catalogAPI.addInventory(data);
        },
        onSuccess: () => {
            toast.success(item ? 'Strategic asset updated' : 'Strategic asset registered');
            onSuccess();
        },
        onError: (error) => {
            toast.error(error.message || 'Registry update failed');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-4xl border border-[#D4AF37]/20 relative">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#D4AF37]/10 px-10 py-6 z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {item ? 'Modify Asset' : 'Register Strategic Asset'}
                        </h3>
                        <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mt-1">Universal Registry Protocol</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#FAFAF8] text-gray-400 hover:text-[#D4AF37] transition-all border border-[#D4AF37]/10"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Unique SKU Registry *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.sku}
                                onChange={(e) => handleChange('sku', e.target.value)}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all font-mono"
                            />
                        </div>
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Structural Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Ring">Ring</option>
                                <option value="Necklace">Necklace</option>
                                <option value="Earring">Earring</option>
                                <option value="Bracelet">Bracelet</option>
                                <option value="Pendant">Pendant</option>
                            </select>
                        </div>
                    </div>

                    <div className="group/field">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                            Asset Nomenclature *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Ex: Diamond Solitaire Rose Gold..."
                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                        />
                    </div>

                    <div className="group/field">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                            Detailed Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            placeholder="Material origin, craftsmanship details..."
                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                        />
                    </div>

                    {/* Material */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Metal Hub
                            </label>
                            <select
                                value={formData.material?.metal}
                                onChange={(e) => handleNestedChange('material', 'metal', e.target.value)}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Platinum">Platinum</option>
                            </select>
                        </div>
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Purity Logic
                            </label>
                            <input
                                type="text"
                                value={formData.material?.purity}
                                onChange={(e) => handleNestedChange('material', 'purity', e.target.value)}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                            />
                        </div>
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Weight (g)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.material?.weight}
                                onChange={(e) => handleNestedChange('material', 'weight', parseFloat(e.target.value))}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Core Valuation (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.baseCost}
                                onChange={(e) => handleChange('baseCost', parseFloat(e.target.value))}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all text-[#D4AF37]"
                            />
                        </div>
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                Reserved Depth *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.stockQuantity}
                                onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value))}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                            />
                        </div>
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                                MOQ
                            </label>
                            <input
                                type="number"
                                value={formData.minOrderQuantity}
                                onChange={(e) => handleChange('minOrderQuantity', parseInt(e.target.value))}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="group/field">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within/field:text-[#D4AF37] transition-colors">
                            Visual Asset URI
                        </label>
                        <input
                            type="url"
                            value={formData.images?.[0] || ''}
                            onChange={(e) => handleChange('images', [e.target.value])}
                            placeholder="https://cloud.jewelry.com/assets/..."
                            className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#F7E7CE]/30 transition-all"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-8 border-t border-[#D4AF37]/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#1A1A1A] transition-colors"
                        >
                            Abort Protocol
                        </button>
                        <button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="px-12 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#D4AF37]/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all outline-none border border-white/10"
                        >
                            {saveMutation.isPending ? 'Synchronizing...' : (item ? 'Execute Modification' : 'Finalize Registration')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
