import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cartAPI, quotationAPI } from '../../utils/api';
import CommunicationPanel from '../../components/CommunicationPanel';

export default function SalesDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('incoming');
    const [commContext, setCommContext] = useState({ open: false, type: '', id: '' });

    // Fetch submitted carts (Incoming Requests)
    const { data: submittedCarts, isLoading: loadingIncoming } = useQuery({
        queryKey: ['carts', 'submitted'],
        queryFn: () => cartAPI.getAll({ status: 'Submitted' }),
        enabled: activeTab === 'incoming',
    });

    // Fetch quotations
    const { data: quotations, isLoading: loadingQuotations } = useQuery({
        queryKey: ['quotations'],
        queryFn: () => quotationAPI.getAll(),
        enabled: activeTab === 'quotations',
    });

    // Fetch reviewed carts (Under Review or Quoted)
    const { data: reviewedCarts, isLoading: loadingReviews } = useQuery({
        queryKey: ['carts', 'reviewed'],
        queryFn: async () => {
            const underReview = await cartAPI.getAll({ status: 'Under Review' });
            const approved = await cartAPI.getAll({ status: 'Approved' });
            const quoted = await cartAPI.getAll({ status: 'Quoted' });
            return {
                data: [
                    ...(underReview.data || []),
                    ...(approved.data || []),
                    ...(quoted.data || [])
                ]
            };
        },
        enabled: activeTab === 'reviews',
    });

    const tabs = [
        {
            id: 'incoming', label: 'Incoming Requests', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            id: 'quotations', label: 'Generated Quotations', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: 'reviews', label: 'Reviews Made', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            {/* Premium Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-white to-[#FAFAF8] border-r border-[#D4AF37]/20 flex flex-col fixed inset-y-0 shadow-xl z-20">
                <div className="p-6 border-b border-[#D4AF37]/20 bg-gradient-to-br from-[#F7E7CE]/30 to-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] p-2.5 rounded-xl shadow-lg shadow-[#D4AF37]/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Sales Hub
                        </h2>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F7E7CE]/30 text-[#D4AF37] shadow-md shadow-[#D4AF37]/10 border border-[#D4AF37]/20 font-semibold'
                                : 'text-gray-600 hover:bg-[#F7E7CE]/20 hover:text-[#1A1A1A] border border-transparent font-medium'
                                }`}
                        >
                            <span className={activeTab === tab.id ? 'text-[#D4AF37]' : 'text-gray-400'}>
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-[#D4AF37]/20 bg-gradient-to-br from-[#F7E7CE]/20 to-transparent">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-red-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h1>
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">Manage your sourcing and quotation pipeline with precision</p>
                </div>

                {activeTab === 'incoming' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7E7CE]/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#D4AF37]/10 transition-all duration-700"></div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">New Requests</p>
                                <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{submittedCarts?.data?.length || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                            <table className="min-w-full divide-y divide-[#D4AF37]/10">
                                <thead className="bg-[#F7E7CE]/20">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cart Identity</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Profile</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory Items</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submission Date</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D4AF37]/5">
                                    {submittedCarts?.data?.map((cart) => (
                                        <tr key={cart._id} className="hover:bg-[#F7E7CE]/10 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{cart.cartNumber}</div>
                                                <div className="text-[9px] text-gray-400 font-mono tracking-tighter opacity-70 italic uppercase">ID: {cart._id.substring(cart._id.length - 8)}</div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.name}</div>
                                                <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{cart.userId?.company || 'Elite Individual'}</div>
                                            </td>
                                            <td className="px-6 py-6 font-medium">
                                                <span className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
                                                    {cart.items?.length || 0} Pieces
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-xs text-gray-500 font-semibold italic">
                                                {new Date(cart.submittedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <Link
                                                        to={`/sales/cart-review/${cart._id}`}
                                                        className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Review Detail
                                                    </Link>
                                                    <button
                                                        onClick={() => setCommContext({ open: true, type: 'Cart', id: cart._id })}
                                                        className="p-2.5 text-gray-400 hover:text-[#D4AF37] transition-all bg-[#FAFAF8] rounded-xl border border-[#D4AF37]/5 hover:border-[#D4AF37]/30 hover:bg-white"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!loadingIncoming && (!submittedCarts?.data || submittedCarts.data.length === 0)) && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                                                No incoming requests at the moment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'quotations' && (
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                        <table className="min-w-full divide-y divide-[#D4AF37]/10">
                            <thead className="bg-[#F7E7CE]/20">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quotation Identify</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Profile</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Investment Value</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Status</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interface</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4AF37]/5">
                                {quotations?.data?.map((qt) => (
                                    <tr key={qt._id} className="hover:bg-[#F7E7CE]/10 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{qt.quotationNumber}</div>
                                            <div className="text-[10px] text-gray-400 font-mono tracking-tighter opacity-70">Version {qt.version}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{qt.userId?.name}</div>
                                            <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{qt.userId?.company || 'Elite Individual'}</div>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="text-sm font-black text-[#1A1A1A]">₹{qt.grandTotal?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-[#D4AF37]/10 ${qt.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                qt.status === 'Draft' ? 'bg-[#F7E7CE] text-[#D4AF37]' :
                                                    'bg-[#1A1A1A] text-white'
                                                }`}>
                                                {qt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    onClick={() => quotationAPI.downloadPdf(qt._id)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:underline hover:underline-offset-4"
                                                >
                                                    Generate PDF
                                                </button>
                                                <button
                                                    onClick={() => setCommContext({ open: true, type: 'Quotation', id: qt._id })}
                                                    className="p-2.5 text-gray-400 hover:text-[#D4AF37] transition-all bg-[#FAFAF8] rounded-xl border border-[#D4AF37]/5 hover:border-[#D4AF37]/30 hover:bg-white"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!loadingQuotations && (!quotations?.data || quotations.data.length === 0)) && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                                            No quotations generated yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                        <table className="min-w-full divide-y divide-[#D4AF37]/10">
                            <thead className="bg-[#F7E7CE]/20">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cart Identity</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Profile</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Pulse</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4AF37]/5">
                                {reviewedCarts?.data?.map((cart) => (
                                    <tr key={cart._id} className="hover:bg-[#F7E7CE]/10 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{cart.cartNumber}</div>
                                            <div className="text-[10px] text-gray-400 font-mono tracking-tighter opacity-70 italic uppercase">{cart.items?.length} items</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.name}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-[#D4AF37]/10 ${cart.status === 'Quoted' ? 'bg-[#1A1A1A] text-white' :
                                                cart.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    'bg-[#F7E7CE] text-[#D4AF37]'
                                                }`}>
                                                {cart.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <Link
                                                to={`/sales/cart-review/${cart._id}`}
                                                className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:underline hover:underline-offset-4"
                                            >
                                                Refine Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {(!loadingReviews && (!reviewedCarts?.data || reviewedCarts.data.length === 0)) && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                            No reviews made yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {commContext.open && (
                <CommunicationPanel
                    isOpen={commContext.open}
                    contextType={commContext.type}
                    contextId={commContext.id}
                    onClose={() => setCommContext({ ...commContext, open: false })}
                />
            )}
        </div>
    );
}
