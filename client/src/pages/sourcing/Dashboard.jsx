import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { cartAPI } from '../../utils/api';
import manufacturerAPI from '../../api/manufacturer';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ManufacturerTabContent from './ManufacturerTabContent';
import SourcingSidebar from '../../components/SourcingSidebar';

export default function SourcingDashboard() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('queue');
    const [selectedCartId, setSelectedCartId] = useState(null);

    // Sync tab with URL query param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['queue', 'assigned', 'all', 'manufacturers'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    // Fetch carts under review (Validation Queue)
    const { data: queueCarts, isLoading: loadingQueue } = useQuery({
        queryKey: ['carts', 'sourcing-queue'],
        queryFn: () => cartAPI.getAll({ status: 'Under Review' }),
    });

    // Fetch My Assignments
    const { data: assignedCarts, isLoading: loadingAssigned } = useQuery({
        queryKey: ['carts', 'sourcing-assigned', user?._id],
        queryFn: () => cartAPI.getAll({ assignedToSourcing: user?._id }),
    });

    // Fetch All Carts for Sourcing Hub
    const { data: allHubCarts, isLoading: loadingAll } = useQuery({
        queryKey: ['carts', 'sourcing-all'],
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
    });

    const tabs = [
        {
            id: 'queue', label: 'Validation Queue', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            id: 'assigned', label: 'My Assignments', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 'all', label: 'All Hub Carts', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            )
        },
        {
            id: 'manufacturers', label: 'Manufacturers', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            <SourcingSidebar
                activeTab={activeTab}
                onTabChange={(id) => {
                    setActiveTab(id);
                    setSelectedCartId(null);
                }}
            />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {selectedCartId ? (
                    <SourcingDetailView
                        cartId={selectedCartId}
                        onBack={() => setSelectedCartId(null)}
                    />
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="mb-10">
                            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h1>
                            <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">
                                {activeTab === 'manufacturers'
                                    ? 'Manage your manufacturer catalog and supplier products'
                                    : 'Validate manufacturability and provide ethical sourcing data.'}
                            </p>
                        </div>

                        {/* Conditional rendering based on active tab */}
                        {activeTab === 'manufacturers' ? (
                            <ManufacturerTabContent />
                        ) : (
                            <>
                                {/* Top Stats - Glassmorphism */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7E7CE]/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#D4AF37]/10 transition-all duration-700"></div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Queue Size</p>
                                        <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {queueCarts?.data?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-green-100/10 transition-all duration-700"></div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">My Assignments</p>
                                        <p className="text-4xl font-bold text-green-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {assignedCarts?.data?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-purple-100/10 transition-all duration-700"></div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Avg. Response</p>
                                        <p className="text-4xl font-bold text-purple-600" style={{ fontFamily: "'Playfair Display', serif" }}>2.4h</p>
                                    </div>
                                </div>

                                {/* List Component based on active tab */}
                                <CartList
                                    carts={activeTab === 'queue' ? queueCarts?.data : (activeTab === 'assigned' ? assignedCarts?.data : allHubCarts?.data)}
                                    isLoading={activeTab === 'queue' ? loadingQueue : (activeTab === 'assigned' ? loadingAssigned : loadingAll)}
                                    onViewDetails={setSelectedCartId}
                                />
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function CartList({ carts, isLoading, onViewDetails }) {
    if (isLoading) {
        return (
            <div className="p-20 text-center bg-white/80 backdrop-blur-md rounded-[3rem] border border-[#D4AF37]/10 shadow-2xl">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37] mx-auto"></div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing pipeline data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
            <table className="min-w-full divide-y divide-[#D4AF37]/10">
                <thead className="bg-[#F7E7CE]/20">
                    <tr>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Request Identity</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Profile</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory Pieces</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Status</th>
                        <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interface</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/5">
                    {carts?.length > 0 ? (
                        carts.map((cart) => (
                            <tr key={cart._id} className="hover:bg-[#F7E7CE]/10 transition-all group">
                                <td className="px-6 py-6">
                                    <div className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors uppercase tracking-tight">
                                        {cart.cartNumber}
                                    </div>
                                    <div className="text-[9px] text-gray-400 font-mono italic uppercase tracking-tighter opacity-70">
                                        Observed {new Date(cart.submittedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-medium">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-[#D4AF37]/20">
                                            {cart.userId?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.name}</div>
                                            <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{cart.userId?.company || 'Elite Individual'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-medium">
                                    <span className="text-[10px] font-black text-white bg-[#1A1A1A] px-3 py-1 rounded-full shadow-lg shadow-black/10 uppercase tracking-widest">
                                        {cart.items?.length || 0} Pieces
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-[#D4AF37]/10 ${cart.status === 'Under Review' ? 'bg-[#F7E7CE] text-[#D4AF37]' :
                                        cart.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            cart.status === 'Quoted' ? 'bg-[#1A1A1A] text-white' :
                                                'bg-gray-50 text-gray-700'
                                        }`}>
                                        {cart.status}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button
                                        onClick={() => onViewDetails(cart._id)}
                                        className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 hover:scale-105 active:scale-95 transition-all outline-none"
                                    >
                                        Validate
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-24 text-center">
                                <div className="text-5xl mb-6 opacity-20">💎</div>
                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Registry is currently vacant</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function SourcingDetailView({ cartId, onBack }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: cartResponse, isLoading, refetch } = useQuery({
        queryKey: ['cart', cartId],
        queryFn: () => cartAPI.getById(cartId),
    });

    const [editingItemId, setEditingItemId] = useState(null);
    const [itemStatus, setItemStatus] = useState('');
    const [notes, setNotes] = useState('');

    const cart = cartResponse?.data;

    const handleUpdateItem = async (itemId) => {
        try {
            await cartAPI.updateItemStatus(cartId, itemId, {
                status: itemStatus,
                salesNotes: notes // Reusing salesNotes for sourcing notes for now or we could add sourcingNotes
            });
            setEditingItemId(null);
            refetch();
            queryClient.invalidateQueries(['carts']);
            toast.success('Material status synchronized');
        } catch (error) {
            console.error('Failed to update item:', error);
            toast.error('Synchronization failure');
        }
    };

    const handleAssign = async () => {
        try {
            await cartAPI.assign(cartId, { role: 'sourcing', userId: user._id });
            refetch();
            queryClient.invalidateQueries(['carts']);
            toast.success('Consignment assigned to your hub');
        } catch (error) {
            console.error('Failed to assign cart:', error);
            toast.error('Assignment failure');
        }
    };
    const handleFinalize = async () => {
        try {
            await cartAPI.approve(cartId);
            refetch();
            queryClient.invalidateQueries(['carts']);
            toast.success('Hub validation finalized');
        } catch (error) {
            console.error('Failed to finalize validation:', error);
            toast.error('Validation closure failed');
        }
    };

    if (isLoading) return (
        <div className="p-20 text-center animate-pulse">
            <div className="h-20 w-20 bg-[#F7E7CE] rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="h-10 w-10 bg-[#D4AF37] rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Hub Intelligence...</p>
        </div>
    );

    if (!cart) return (
        <div className="p-20 text-center">
            <div className="text-6xl mb-6">🚫</div>
            <p className="text-[#1A1A1A] font-bold uppercase tracking-[0.2em] text-lg mb-2">Access Denied</p>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Cart identity has been voided or removed</p>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button
                onClick={onBack}
                className="mb-10 flex items-center text-[10px] font-black text-gray-400 hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-all group"
            >
                <svg className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Regress to Hub Operations
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Items Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-[#D4AF37]/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-2 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#B8941F] w-full opacity-30"></div>

                        <div className="flex justify-between items-start mb-14">
                            <div>
                                <h2 className="text-4xl font-bold text-[#1A1A1A] flex items-center gap-5 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    <span className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl shadow-[#D4AF37]/20">#</span>
                                    {cart.cartNumber}
                                </h2>
                                <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.3em] mt-3 ml-1">Ethical Sourcing & Material Validation</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Protocol Sync</span>
                                <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[#F7E7CE] text-[#D4AF37] border border-[#D4AF37]/20 shadow-sm ring-4 ring-[#F7E7CE]/50">
                                    {cart.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {cart.items.map((item) => (
                                <div key={item._id} className="group border border-[#D4AF37]/5 rounded-[2.5rem] p-8 hover:border-[#D4AF37]/20 hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all bg-[#FAFAF8]/50 overflow-hidden relative">
                                    <div className="flex gap-10">
                                        <div className="h-40 w-40 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group-hover:rotate-3 group-hover:scale-110 transition-all duration-700 flex-shrink-0">
                                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] uppercase tracking-tight transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{item.category}</p>
                                                </div>
                                                <div className="bg-white/80 p-3 px-5 rounded-2xl border border-[#D4AF37]/5 shadow-sm">
                                                    <span className="text-[8px] font-black text-gray-400 block uppercase tracking-widest mb-1 text-center">Batch Quantity</span>
                                                    <span className="text-lg font-bold text-[#1A1A1A] italic block text-center" style={{ fontFamily: "'Playfair Display', serif" }}>x{item.quantity}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5 mb-8">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${item.reviewStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    item.reviewStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        item.reviewStatus === 'Sourcing' ? 'bg-[#1A1A1A] text-white' :
                                                            'bg-[#F7E7CE] text-[#D4AF37] border-[#D4AF37]/20'
                                                    }`}>
                                                    {item.reviewStatus}
                                                </span>
                                                <div className="h-1 w-1 rounded-full bg-[#D4AF37]/30"></div>
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/60 border border-[#D4AF37]/5 px-3 py-1.5 rounded-xl">
                                                    Channel: <span className="text-[#D4AF37] underline decoration-1 underline-offset-4">{item.sourceType}</span>
                                                </span>
                                            </div>

                                            {editingItemId === item._id ? (
                                                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-[#D4AF37]/20 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Validation Verdict</label>
                                                            <select
                                                                value={itemStatus}
                                                                onChange={(e) => setItemStatus(e.target.value)}
                                                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-[#D4AF37] transition-all"
                                                            >
                                                                <option value="Pending">Pending Review</option>
                                                                <option value="Sourcing">Awaiting Sourcing Data</option>
                                                                <option value="Approved">Approve (Manufacturable)</option>
                                                                <option value="Rejected">Reject (Infeasible)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Logistical Intelligence</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Lead times, material origins..."
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-[#D4AF37] transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-3 pt-4 border-t border-[#D4AF37]/5">
                                                        <button
                                                            onClick={() => setEditingItemId(null)}
                                                            className="px-6 py-2.5 text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 hover:text-[#1A1A1A] transition-colors"
                                                        >
                                                            Abort
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateItem(item._id)}
                                                            className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-all"
                                                        >
                                                            Synchronize
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItemId(item._id);
                                                            setItemStatus(item.reviewStatus);
                                                            setNotes(item.salesNotes || '');
                                                        }}
                                                        className="px-8 py-3 bg-white border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all shadow-xl shadow-[#D4AF37]/10"
                                                    >
                                                        Review Detail
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-10">
                    {/* Customer Insights Card */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-[#D4AF37]/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7E7CE]/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#D4AF37]/10 transition-all duration-1000"></div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Partner Signal</h3>
                        <div className="flex items-center gap-6 mb-10">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-[#D4AF37]/30 ring-4 ring-white border border-[#D4AF37]/20">
                                {cart.userId?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.name}</p>
                                <div className="flex items-center gap-2.5 mt-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"></span>
                                    <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest">Active Client</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="p-5 bg-[#FAFAF8] rounded-2xl border border-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all cursor-default group/field">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 group-hover/field:text-[#D4AF37] transition-colors">Corporate Identity</p>
                                <p className="text-sm font-bold text-[#1A1A1A] italic underline decoration-1 underline-offset-4 decoration-[#D4AF37]/20" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.company || 'Elite Individual'}</p>
                            </div>
                            <div className="p-5 bg-[#FAFAF8] rounded-2xl border border-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all cursor-default group/field">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 group-hover/field:text-[#D4AF37] transition-colors">Digital Frequency</p>
                                <p className="text-sm font-bold text-[#1A1A1A]/70 lowercase tracking-tight">{cart.userId?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Hub Actions Card */}
                    <div className="bg-[#1A1A1A] rounded-[2.5rem] p-10 border border-white/10 shadow-3xl text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full -mr-20 -mb-20 blur-3xl group-hover:bg-[#D4AF37]/20 transition-all duration-1000"></div>
                        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">Hub Directives</h3>
                        <div className="space-y-5">
                            <button
                                onClick={handleAssign}
                                disabled={cart.assignedTo?.sourcing?._id === user._id}
                                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-[0.97] transition-all outline-none border ${cart.assignedTo?.sourcing?._id === user._id
                                    ? 'bg-transparent border-[#D4AF37] text-[#D4AF37] cursor-default'
                                    : 'bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white border-transparent hover:shadow-[#D4AF37]/20'
                                    }`}
                            >
                                {cart.assignedTo?.sourcing?._id === user._id ? '✓ Sourcing Synchronized' : 'Synchronize Sourcing'}
                            </button>

                            <button
                                onClick={handleFinalize}
                                disabled={cart.status === 'Approved'}
                                className="w-full bg-white/5 hover:bg-white/10 text-white/80 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all outline-none border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                            >
                                {cart.status === 'Approved' ? 'Validation Closure Confirmed' : 'Finalize Hub Validation'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
