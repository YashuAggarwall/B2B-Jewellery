import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import SourcingSidebar from '../../components/SourcingSidebar';
import manufacturerAPI from '../../api/manufacturer';

const ManufacturerList = () => {
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

    const skus = skusResponse?.data || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: manufacturerAPI.delete,
        onSuccess: () => {
            toast.success('Manufacturer SKU deleted successfully');
            queryClient.invalidateQueries(['manufacturer-skus']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete SKU');
        },
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: manufacturerAPI.approve,
        onSuccess: () => {
            toast.success('Manufacturer SKU approved');
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
            toast.success('Status updated');
            queryClient.invalidateQueries(['manufacturer-skus']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update status');
        },
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleApprove = (id) => {
        approveMutation.mutate(id);
    };

    const handleToggleActive = (id, currentStatus) => {
        toggleActiveMutation.mutate({ id, isActive: !currentStatus });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SourcingSidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Manufacturer SKUs</h1>
                        <p className="text-gray-500">Manage your manufacturer catalog and supplier products</p>
                    </div>
                    <button
                        onClick={() => navigate('/sourcing/manufacturers/add')}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New SKU
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by SKU or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Category
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
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
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Status
                            </label>
                            <select
                                value={approvalFilter}
                                onChange={(e) => setApprovalFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
                            >
                                <option value="">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading manufacturer SKUs...</p>
                        </div>
                    ) : skus.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">No SKUs Found</p>
                            <button
                                onClick={() => navigate('/sourcing/manufacturers/add')}
                                className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                Add Your First SKU
                            </button>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">SKU</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Cost</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">MOQ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Lead Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {skus.map((sku) => (
                                    <tr key={sku._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{sku.internalSKU}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {sku.imageUrl && (
                                                    <img src={sku.imageUrl} alt={sku.name} className="w-10 h-10 rounded-lg object-cover" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{sku.name}</div>
                                                    <div className="text-xs text-gray-500">{sku.supplierName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                                                {sku.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">₹{sku.baseCost?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{sku.moq}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{sku.leadTimeDays} days</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${sku.isApproved
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                    {sku.isApproved ? '✓ Approved' : '⏳ Pending'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${sku.isActive
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-gray-50 text-gray-700'
                                                    }`}>
                                                    {sku.isActive ? '🟢 Active' : '🔴 Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!sku.isApproved && (
                                                    <button
                                                        onClick={() => handleApprove(sku._id)}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleToggleActive(sku._id, sku.isActive)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${sku.isActive
                                                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                        }`}
                                                    title={sku.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {sku.isActive ? '⏸' : '▶'}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/sourcing/manufacturers/edit/${sku._id}`)}
                                                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg hover:bg-primary-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sku._id, sku.name)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Results Count */}
                {!isLoading && skus.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Showing {skus.length} manufacturer SKU{skus.length !== 1 ? 's' : ''}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManufacturerList;
