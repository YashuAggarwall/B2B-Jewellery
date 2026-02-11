import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import SourcingSidebar from '../../components/SourcingSidebar';
import manufacturerAPI from '../../api/manufacturer';

const AddManufacturerSKU = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        internalSKU: `MFG-${Math.floor(100000 + Math.random() * 900000)}`,
        supplierIdInternal: '',
        supplierName: '',
        alibabaProductId: '',
        name: '',
        description: '',
        imageUrl: '',
        category: 'Ring',
        baseCost: '',
        moq: 1,
        leadTimeDays: '',
        customizationScope: 'Limited',
        customizationOptions: {
            metalChange: false,
            stoneChange: false,
            sizeAdjustment: false,
            engraving: false,
            finishChange: false,
        },
        material: {
            metal: '',
            stones: [],
        },
        specifications: {
            weight: '',
            shape: '',
            finish: '',
        },
        images: [],
        isApproved: false,
        isActive: true,
    });

    const [errors, setErrors] = useState({});

    const createMutation = useMutation({
        mutationFn: manufacturerAPI.create,
        onSuccess: () => {
            toast.success('Manufacturer SKU created successfully!');
            queryClient.invalidateQueries(['manufacturer-skus']);
            navigate('/sourcing/manufacturers');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create SKU');
        },
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleStonesChange = (e) => {
        const stones = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({
            ...prev,
            material: {
                ...prev.material,
                stones,
            },
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.internalSKU) newErrors.internalSKU = 'Internal SKU is required';
        if (!formData.supplierIdInternal) newErrors.supplierIdInternal = 'Supplier ID is required';
        if (!formData.supplierName) newErrors.supplierName = 'Supplier name is required';
        if (!formData.name) newErrors.name = 'Product name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.baseCost || formData.baseCost <= 0) newErrors.baseCost = 'Valid base cost is required';
        if (!formData.moq || formData.moq < 1) newErrors.moq = 'MOQ must be at least 1';
        if (!formData.leadTimeDays || formData.leadTimeDays < 1) newErrors.leadTimeDays = 'Lead time is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        // Convert string numbers to actual numbers
        const submitData = {
            ...formData,
            baseCost: parseFloat(formData.baseCost),
            moq: parseInt(formData.moq),
            leadTimeDays: parseInt(formData.leadTimeDays),
            specifications: {
                ...formData.specifications,
                weight: formData.specifications.weight ? parseFloat(formData.specifications.weight) : undefined,
            },
        };

        createMutation.mutate(submitData);
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            <SourcingSidebar />

            <main className="flex-1 ml-64 p-12">
                {/* Header */}
                <div className="mb-12 relative">
                    <button
                        onClick={() => navigate('/sourcing/dashboard?tab=manufacturers')}
                        className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-6 hover:text-[#B8941F] transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-[#D4AF37]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        Back to Registry
                    </button>
                    <div className="flex items-end gap-6">
                        <h1 className="text-5xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Initialize SKU
                        </h1>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent mb-4"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Protocol: MFG-ENTRY</span>
                    </div>
                    <p className="text-gray-500 mt-2 font-medium italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Create a new professional manufacturer product entry in the global ledger</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-5xl space-y-10">
                    {/* Supplier Information */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-[#D4AF37]/10 p-10 relative overflow-hidden group/card hover:border-[#D4AF37]/30 transition-all">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-bl-full -mr-20 -mt-20 group-hover/card:scale-110 transition-transform duration-700"></div>

                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <span className="w-1.5 h-8 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></span>
                            Supplier Intelligence
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Supplier Identifier
                                </label>
                                <input
                                    type="text"
                                    name="supplierIdInternal"
                                    value={formData.supplierIdInternal}
                                    onChange={handleChange}
                                    className={`w-full px-6 py-4 bg-[#FAFAF8] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.supplierIdInternal ? 'border-red-500' : 'border-[#D4AF37]/10'
                                        }`}
                                    placeholder="SUP-12345"
                                />
                                {errors.supplierIdInternal && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.supplierIdInternal}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Entity Name
                                </label>
                                <input
                                    type="text"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleChange}
                                    className={`w-full px-6 py-4 bg-[#FAFAF8] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.supplierName ? 'border-red-500' : 'border-[#D4AF37]/10'
                                        }`}
                                    placeholder="Golden Jewelry Co."
                                />
                                {errors.supplierName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.supplierName}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Digital Asset Reference (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="alibabaProductId"
                                    value={formData.alibabaProductId}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                    placeholder="e.g. Alibaba ID or External Link"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Specifications */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-[#D4AF37]/10 p-10 relative overflow-hidden group/card hover:border-[#D4AF37]/30 transition-all">
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <span className="w-1.5 h-8 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></span>
                            Product Blueprint
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Internal Protocol SKU
                                </label>
                                <input
                                    type="text"
                                    name="internalSKU"
                                    value={formData.internalSKU}
                                    onChange={handleChange}
                                    className={`w-full px-6 py-4 bg-[#FAFAF8] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.internalSKU ? 'border-red-500' : 'border-[#D4AF37]/10'
                                        }`}
                                />
                                {errors.internalSKU && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.internalSKU}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Registry Class
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23D4AF37\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                                >
                                    <option value="Ring">Ring</option>
                                    <option value="Necklace">Necklace</option>
                                    <option value="Earring">Earring</option>
                                    <option value="Bracelet">Bracelet</option>
                                    <option value="Pendant">Pendant</option>
                                    <option value="Brooch">Brooch</option>
                                    <option value="Other">Other Class</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Collection Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-6 py-4 bg-[#FAFAF8] border rounded-2xl text-lg font-bold text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.name ? 'border-red-500' : 'border-[#D4AF37]/10'
                                        }`}
                                    placeholder="Classic Diamond Ring"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Aesthetic Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all resize-none shadow-inner"
                                    placeholder="Describe the craftsmanship, style, and unique features..."
                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Visual Representation (URL)
                                </label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                    placeholder="https://exclusive-vault.com/item.jpg"
                                />
                                {formData.imageUrl && (
                                    <div className="mt-4 h-48 w-full rounded-2xl overflow-hidden border border-[#D4AF37]/10 bg-gray-50 flex items-center justify-center">
                                        <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Deployment */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-[#D4AF37]/10 p-10 relative overflow-hidden group/card hover:border-[#D4AF37]/30 transition-all">
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <span className="w-1.5 h-8 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></span>
                            Pricing & Logistics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 text-[#B8941F]">
                                    Base Investment (₹)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#B8941F] font-bold">₹</div>
                                    <input
                                        type="number"
                                        name="baseCost"
                                        value={formData.baseCost}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full pl-12 pr-6 py-4 bg-[#FAFAF8] border rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.baseCost ? 'border-red-500' : 'border-[#D4AF37]/10'
                                            }`}
                                        placeholder="5,000"
                                    />
                                </div>
                                {errors.baseCost && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.baseCost}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Minimum Order Quantity
                                </label>
                                <input
                                    type="number"
                                    name="moq"
                                    value={formData.moq}
                                    onChange={handleChange}
                                    min="1"
                                    className={`w-full px-6 py-4 bg-[#FAFAF8] border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.moq ? 'border-red-500' : 'border-[#D4AF37]/10'
                                        }`}
                                />
                                {errors.moq && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.moq}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Lead Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    name="leadTimeDays"
                                    value={formData.leadTimeDays}
                                    onChange={handleChange}
                                    min="1"
                                    className={`w-full px-6 py-4 bg-[#FAFAF8] border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all ${errors.leadTimeDays ? 'border-red-500' : 'border-[#D4AF37]/10'
                                        }`}
                                />
                                {errors.leadTimeDays && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.leadTimeDays}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Customization & Materials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-[#D4AF37]/10 p-10 group/card hover:border-[#D4AF37]/30 transition-all">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                <span className="w-1.5 h-6 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></span>
                                Customization Protocol
                            </h2>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                        Modification Scope
                                    </label>
                                    <select
                                        name="customizationScope"
                                        value={formData.customizationScope}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all appearance-none cursor-pointer"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23D4AF37\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                                    >
                                        <option value="None">Locked</option>
                                        <option value="Limited">Limited Adjustments</option>
                                        <option value="Moderate">Moderate Flex</option>
                                        <option value="Extensive">Full Bespoke</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {['metalChange', 'stoneChange', 'sizeAdjustment', 'engraving', 'finishChange'].map((option) => (
                                        <label key={option} className="flex items-center gap-4 p-4 rounded-2xl border border-[#D4AF37]/5 bg-[#FAFAF8] cursor-pointer hover:bg-[#F7E7CE]/10 transition-colors group/opt">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name={`customizationOptions.${option}`}
                                                    checked={formData.customizationOptions[option]}
                                                    onChange={handleChange}
                                                    className="w-6 h-6 border-[#D4AF37]/20 rounded-lg text-[#1A1A1A] focus:ring-[#D4AF37] transition-colors cursor-pointer"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-widest group-hover/opt:text-[#1A1A1A] transition-colors">
                                                {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-[#D4AF37]/10 p-10 group/card hover:border-[#D4AF37]/30 transition-all">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                <span className="w-1.5 h-6 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></span>
                                Material Dossier
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                        Core Metal
                                    </label>
                                    <input
                                        type="text"
                                        name="material.metal"
                                        value={formData.material.metal}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                        placeholder="e.g. 18K Yellow Gold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                        Gemstones (CSV)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.material.stones.join(', ')}
                                        onChange={handleStonesChange}
                                        className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                        placeholder="Diamond, Emerald, Sapphire"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                            Gross Weight (g)
                                        </label>
                                        <input
                                            type="number"
                                            name="specifications.weight"
                                            value={formData.specifications.weight}
                                            onChange={handleChange}
                                            step="0.01"
                                            className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                            placeholder="3.5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                            Geometric Shape
                                        </label>
                                        <input
                                            type="text"
                                            name="specifications.shape"
                                            value={formData.specifications.shape}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                            placeholder="Round Brilliant"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                        Texture & Finish
                                    </label>
                                    <input
                                        type="text"
                                        name="specifications.finish"
                                        value={formData.specifications.finish}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all"
                                        placeholder="Mirror Polished"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registry Status */}
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-bl-full -mr-32 -mt-32"></div>

                        <h2 className="text-xl font-bold mb-8 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                            Registry Validation
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <label className="flex items-center gap-6 p-6 rounded-3xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group/status">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isApproved"
                                        checked={formData.isApproved}
                                        onChange={handleChange}
                                        className="w-7 h-7 border-white/20 rounded-xl text-[#D4AF37] focus:ring-[#D4AF37] transition-all cursor-pointer bg-transparent"
                                    />
                                </div>
                                <div>
                                    <span className="text-sm font-black uppercase tracking-[0.2em] group-hover:text-[#D4AF37] transition-colors">Grant Approval</span>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Inclusion in active recommendation matrices</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-6 p-6 rounded-3xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group/status">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="w-7 h-7 border-white/20 rounded-xl text-[#D4AF37] focus:ring-[#D4AF37] transition-all cursor-pointer bg-transparent"
                                    />
                                </div>
                                <div>
                                    <span className="text-sm font-black uppercase tracking-[0.2em] group-hover:text-[#D4AF37] transition-colors">Live In Catalog</span>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Visibility within global inventory searches</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Terminal Actions */}
                    <div className="flex items-center gap-8 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/sourcing/manufacturers')}
                            className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#1A1A1A] transition-colors"
                        >
                            Abandone Entry
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Committing...
                                </>
                            ) : (
                                <>
                                    Commit to Registry
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddManufacturerSKU;
