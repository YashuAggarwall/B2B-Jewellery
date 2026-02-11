import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI, quotationAPI } from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function CartHistory() {
    const navigate = useNavigate();
    const [expandedCartId, setExpandedCartId] = useState(null);
    const [cancelDialog, setCancelDialog] = useState({ isOpen: false, cartId: null, cartNumber: '' });
    const queryClient = useQueryClient();

    const { data: history, isLoading } = useQuery({
        queryKey: ['cartHistory'],
        queryFn: cartAPI.getHistory,
    });

    const cancelCartMutation = useMutation({
        mutationFn: cartAPI.cancelCart,
        onSuccess: () => {
            queryClient.invalidateQueries(['cartHistory']);
            toast.success('Collection cancelled successfully');
            setCancelDialog({ isOpen: false, cartId: null, cartNumber: '' });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to cancel collection');
            setCancelDialog({ isOpen: false, cartId: null, cartNumber: '' });
        },
    });

    const handleCancelCart = (e, cartId, cartNumber) => {
        e.stopPropagation();
        setCancelDialog({ isOpen: true, cartId, cartNumber });
    };

    const handleViewQuotation = async (e, cartId) => {
        e.stopPropagation();
        try {
            const response = await quotationAPI.getByCart(cartId);
            if (response?.data?._id) {
                navigate(`/quotations/${response.data._id}`);
            } else {
                toast.error('Quotation details not found.');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to retrieve quotation.');
        }
    };

    const confirmCancel = () => {
        if (cancelDialog.cartId) {
            cancelCartMutation.mutate(cancelDialog.cartId);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Under Review': return 'bg-[#F7E7CE]/50 text-[#B8941F] border-[#D4AF37]/20';
            case 'Quoted': return 'bg-[#1A1A1A] text-white border-transparent shadow-lg shadow-black/10';
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Closed': return 'bg-gray-50 text-gray-500 border-gray-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F7E7CE] border-t-[#D4AF37]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Elegant Header Section */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.02em' }}>
                            Collection History
                        </h1>
                        <p className="text-lg text-gray-500" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Track and manage your curated jewelry sourcing portfolio.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white rounded-[2rem] border border-[#D4AF37]/10 p-4 shadow-xl shadow-black/5 flex items-center gap-4">
                            <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] p-3 rounded-xl shadow-lg shadow-[#D4AF37]/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Active Hubs</p>
                                <p className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{history?.data?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registry Table Section */}
                <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#D4AF37]/10">
                            <thead className="bg-[#F7E7CE]/20">
                                <tr>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Hub Identity</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Deployment Date</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Components</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Protocol Status</th>
                                    <th className="px-8 py-6 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4AF37]/5 bg-transparent">
                                {history?.data?.length > 0 ? (
                                    history.data.map((cart) => (
                                        <div key={cart._id} className="contents group">
                                            <tr
                                                className="hover:bg-[#F7E7CE]/10 transition-all cursor-pointer"
                                                onClick={() => setExpandedCartId(expandedCartId === cart._id ? null : cart._id)}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#D4AF37] font-bold text-sm border border-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/10 group-hover:scale-110 transition-transform">
                                                            {cart.cartNumber.split('-')[1]}
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.cartNumber}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono italic opacity-60">REF: {cart._id.substring(18).toUpperCase()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-medium text-gray-600">
                                                    {new Date(cart.submittedAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
                                                        {cart.items?.length || 0} Modules
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(cart.status)}`}>
                                                        {cart.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end items-center gap-4">
                                                        {cart.status === 'Submitted' && (
                                                            <button
                                                                onClick={(e) => handleCancelCart(e, cart._id, cart.cartNumber)}
                                                                className="px-6 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-95 border border-red-200"
                                                            >
                                                                Decommission
                                                            </button>
                                                        )}
                                                        {(cart.status === 'Quoted' || cart.status === 'Approved') && (
                                                            <button
                                                                onClick={(e) => handleViewQuotation(e, cart._id)}
                                                                className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all active:scale-95"
                                                            >
                                                                View Quotation
                                                            </button>
                                                        )}
                                                        <div className={`p-2.5 rounded-xl bg-gray-50 text-gray-400 transition-all ${expandedCartId === cart._id ? 'rotate-180 bg-[#F7E7CE]/30 text-[#D4AF37] border-transparent' : 'border border-gray-100'}`}>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedCartId === cart._id && (
                                                <tr className="animate-in fade-in slide-in-from-top-4 duration-500">
                                                    <td colSpan="5" className="px-10 py-10 bg-[#FAFAF8] border-y border-[#D4AF37]/10">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                            {cart.items?.map((item, idx) => (
                                                                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group/item hover:border-[#D4AF37]/30 transition-all flex flex-col h-full active:scale-[0.98]">
                                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7E7CE]/10 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover/item:scale-150"></div>
                                                                    <div className="relative flex flex-col flex-1">
                                                                        <div className="flex gap-6 mb-6">
                                                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F7E7CE]/30 to-white flex-shrink-0 border border-[#D4AF37]/10 shadow-sm">
                                                                                <img
                                                                                    src={item.images?.[0] || item.imageUrl || '/placeholder.jpg'}
                                                                                    alt={item.name}
                                                                                    className="w-full h-full object-cover"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.src = '/placeholder.jpg';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex-1 min-h-[4.5rem]">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <h4 className="font-bold text-[#1A1A1A] text-xl tracking-tight line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h4>
                                                                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm flex-shrink-0 ${item.reviewStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                                        item.reviewStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                                            'bg-blue-50 text-blue-700 border-blue-100'
                                                                                        }`}>
                                                                                        {item.reviewStatus || 'Awaiting Review'}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">{item.category}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-[#FAFAF8] rounded-2xl p-5 space-y-4 mb-6 border border-[#D4AF37]/5">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Protocol Quantity</span>
                                                                                <span className="text-sm font-black text-[#1A1A1A]">{item.quantity} Units</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estimated Value</span>
                                                                                <span className="text-base font-bold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                                                    ₹{item.platformPriceRange?.min?.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {item.customizationText ? (
                                                                            <div className="p-4 bg-[#F7E7CE]/20 rounded-2xl border border-[#D4AF37]/10 mb-6 italic">
                                                                                <p className="text-[11px] text-[#B8941F] font-medium leading-relaxed line-clamp-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{item.customizationText}"</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex-1"></div>
                                                                        )}

                                                                        <div className="flex items-center gap-3 pt-2 mt-auto">
                                                                            <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50"></div>
                                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sourcing: {item.sourceType}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl border border-[#D4AF37]/10 flex items-center justify-center mb-8">
                                                    <svg className="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-3xl font-bold text-[#1A1A1A] mb-3 uppercase tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Registry Empty</h3>
                                                <p className="text-lg text-gray-400 max-w-sm mx-auto italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your sourcing protocol hasn't initialized any sessions yet. Deployment data will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <ConfirmDialog
                isOpen={cancelDialog.isOpen}
                onClose={() => setCancelDialog({ isOpen: false, cartId: null, cartNumber: '' })}
                onConfirm={confirmCancel}
                title="Decommission Protocol"
                message={`SECURITY ALERT: Are you sure you want to decommission session ${cancelDialog.cartNumber}? All active sourcing scripts for this hub will be terminated immediately.`}
                confirmText="Terminate Protocol"
                cancelText="Maintain Active"
                type="danger"
            />
        </div>
    );
}
