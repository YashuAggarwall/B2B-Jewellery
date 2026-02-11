import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI, quotationAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import CommunicationPanel from '../../components/CommunicationPanel';

export default function CartReview() {
    const { cartId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [itemNotes, setItemNotes] = useState({});

    // Fetch cart details
    const { data: cartResponse, isLoading } = useQuery({
        queryKey: ['cart', cartId],
        queryFn: () => cartAPI.getById(cartId),
    });

    const cart = cartResponse?.data;

    // Mutation for updating item status
    const updateItemMutation = useMutation({
        mutationFn: ({ itemId, status, notes }) =>
            cartAPI.updateItemStatus(cartId, itemId, { status, salesNotes: notes }),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart', cartId]);
            toast.success('Item status updated');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update item status');
        },
    });

    // Mutation for approving all items
    const approveAllMutation = useMutation({
        mutationFn: () => cartAPI.approveAll(cartId),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart', cartId]);
            toast.success('All items approved');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to approve all items');
        },
    });

    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [quotationOptions, setQuotationOptions] = useState({
        notes: '',
        validDays: 30
    });

    const [isCommOpen, setIsCommOpen] = useState(false);

    // Mutation for generating quotation
    const generateQuotationMutation = useMutation({
        mutationFn: (data) => quotationAPI.generate(data),
        onSuccess: (response) => {
            toast.success('Quotation generated successfully!');
            setIsConfigModalOpen(false);
            queryClient.invalidateQueries(['cart', cartId]);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to generate quotation');
        },
    });

    const handleGenerateClick = () => {
        setIsConfigModalOpen(true);
    };

    const handleConfirmGenerate = () => {
        generateQuotationMutation.mutate({
            cartId,
            ...quotationOptions
        });
    };

    // Mutation for finalizing review
    const approveCartMutation = useMutation({
        mutationFn: () => cartAPI.approve(cartId),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart', cartId]);
            toast.success('Cart review finalized and approved!');
            navigate('/sales/dashboard');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to finalize review');
        },
    });

    const handleItemStatusChange = (itemId, status) => {
        updateItemMutation.mutate({ itemId, status, notes: itemNotes[itemId] });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Cart not found</h2>
                <Link to="/sales/dashboard" className="btn-primary">Back to Dashboard</Link>
            </div>
        );
    }

    const approvedCount = cart.items.filter(item => item.reviewStatus === 'Approved').length;
    const pendingCount = cart.items.filter(item => item.reviewStatus === 'Pending').length;
    const allReviewed = cart.items.every(item => item.reviewStatus === 'Approved' || item.reviewStatus === 'Rejected');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Quotation Config Modal */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 border border-[#D4AF37]/20">
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-full -mr-16 -mt-16"></div>
                            <h3 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Finalize Quotation</h3>
                            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">Deployment Protocol Configuration</p>
                        </div>

                        <div className="p-8 space-y-8 bg-gradient-to-b from-white to-[#FAFAF8]">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[#D4AF37] rounded-full"></div>
                                    Protocol Notes
                                </label>
                                <textarea
                                    className="w-full h-32 bg-white border border-[#D4AF37]/10 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none transition-all resize-none shadow-inner"
                                    placeholder="Add special instructions, terms, or notes about these items..."
                                    value={quotationOptions.notes}
                                    onChange={(e) => setQuotationOptions(prev => ({ ...prev, notes: e.target.value }))}
                                />
                                <p className="mt-2 text-[10px] text-gray-400 italic">Visible to customer on execution</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[#B8941F] rounded-full"></div>
                                    Validity Period
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[7, 15, 30, 60].map(days => (
                                        <button
                                            key={days}
                                            onClick={() => setQuotationOptions(prev => ({ ...prev, validDays: days }))}
                                            className={`py-4 rounded-xl text-xs font-black transition-all border ${quotationOptions.validDays === days
                                                ? 'bg-[#1A1A1A] text-white border-transparent shadow-xl'
                                                : 'bg-white text-gray-500 border-[#D4AF37]/10 hover:border-[#D4AF37]/30 hover:bg-[#F7E7CE]/10'}`}
                                        >
                                            {days}d
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-[#FAFAF8] border-t border-[#D4AF37]/10 flex items-center gap-6">
                            <button
                                onClick={() => setIsConfigModalOpen(false)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmGenerate}
                                disabled={generateQuotationMutation.isPending}
                                className="flex-[2] py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:shadow-[#D4AF37]/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {generateQuotationMutation.isPending ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : 'Execute Protocol'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/10 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-12 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/sales/dashboard" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="w-1.5 h-6 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocol: REV-STAGING</span>
                                </div>
                                <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Review Cart: {cart.cartNumber}
                                </h1>
                                <p className="text-gray-500 text-xs font-medium italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Customer: <span className="text-[#1A1A1A] not-italic font-bold">{cart.userId?.name}</span> ({cart.userId?.company || 'No Company'})
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => approveAllMutation.mutate()}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/5 transition-all"
                                disabled={approveAllMutation.isLoading || cart.status === 'Approved' || cart.status === 'Quoted'}
                            >
                                Approve All
                            </button>
                            {allReviewed && cart.status !== 'Approved' && cart.status !== 'Quoted' && (
                                <button
                                    onClick={() => approveCartMutation.mutate()}
                                    className="px-8 py-4 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-black transition-all"
                                    disabled={approveCartMutation.isLoading}
                                >
                                    Finalize Protocol
                                </button>
                            )}
                            <button
                                onClick={handleGenerateClick}
                                className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_30px_rgba(212,175,55,0.25)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.45)] hover:-translate-y-1 transition-all"
                                disabled={generateQuotationMutation.isPending || approvedCount === 0}
                            >
                                {cart.status === 'Quoted' ? 'Regenerate Quotation' : 'Generate Quotation'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-12 py-12 w-full">
                {/* Summary Info - Glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Items to Review</p>
                        <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.items.length}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500"></div>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Approved Status</p>
                        <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{approvedCount}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500"></div>
                        <p className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mb-2">Pending Protocol</p>
                        <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{pendingCount}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cart.items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                {item.images?.[0] || item.imageUrl ? (
                                                    <img
                                                        src={item.images?.[0] || item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://placehold.co/400x400?text=${item.category || 'Jewellery'}`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.category}</div>
                                                <div className="mt-1">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${item.sourceType === 'Inventory' ? 'bg-blue-100 text-blue-700' :
                                                        item.sourceType === 'Manufacturer' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {item.sourceType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                        {item.quantity} units
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={item.reviewStatus}
                                            onChange={(e) => handleItemStatusChange(item._id, e.target.value)}
                                            className={`text-sm font-medium rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2 ${item.reviewStatus === 'Approved' ? 'text-green-700 bg-green-50' :
                                                item.reviewStatus === 'Rejected' ? 'text-red-700 bg-red-50' :
                                                    item.reviewStatus === 'Sourcing' ? 'text-blue-700 bg-blue-50' :
                                                        'text-yellow-700 bg-yellow-50'
                                                }`}
                                        >
                                            <option value="Pending">Pending Review</option>
                                            <option value="Approved">Approve</option>
                                            <option value="Sourcing">Send to Sourcing</option>
                                            <option value="Rejected">Reject</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            placeholder="Internal notes..."
                                            value={itemNotes[item._id] !== undefined ? itemNotes[item._id] : (item.salesNotes || '')}
                                            onChange={(e) => setItemNotes(prev => ({ ...prev, [item._id]: e.target.value }))}
                                            onBlur={() => handleItemStatusChange(item._id, item.reviewStatus)}
                                            className="text-xs border-gray-300 rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleItemStatusChange(item._id, item.reviewStatus)}
                                            className="text-primary-600 hover:text-primary-900"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Communication Panel Overlay */}
            <CommunicationPanel
                contextType="Cart"
                contextId={cartId}
                isOpen={isCommOpen}
                onClose={() => setIsCommOpen(false)}
            />

            {/* Communication Trigger FAB */}
            <button
                onClick={() => setIsCommOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 z-50 group"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute right-full mr-4 px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Customer Chat
                </span>
            </button>
        </div>
    );
}
