import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, cartAPI } from '../../utils/api';
import InventoryManagement from './InventoryManagement';
import SystemSettings from './SystemSettings';
import EmailTemplates from './EmailTemplates';
import AuditLogViewer from './AuditLogViewer';
import MarginManagement from './MarginManagement';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedCartId, setSelectedCartId] = useState(null);

    // Fetch system stats
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminAPI.getStats,
    });

    // Fetch users
    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: adminAPI.getUsers,
    });

    // Fetch margins
    const { data: margins } = useQuery({
        queryKey: ['margins'],
        queryFn: adminAPI.getMargins,
    });

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'inventory', name: 'Inventory', icon: '📦' },
        { id: 'carts', name: 'User Carts', icon: '🛒' },
        { id: 'users', name: 'Users', icon: '👥' },
        { id: 'margins', name: 'Margins', icon: '💰' },
        { id: 'settings', name: 'Settings', icon: '⚙️' },
        { id: 'emails', name: 'Emails', icon: '📧' },
        { id: 'audit', name: 'Audit Logs', icon: '📜' },
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
                            Admin Hub
                        </h2>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setSelectedCartId(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F7E7CE]/30 text-[#D4AF37] shadow-md shadow-[#D4AF37]/10 border border-[#D4AF37]/20 font-semibold'
                                : 'text-gray-600 hover:bg-[#F7E7CE]/20 hover:text-[#1A1A1A] border border-transparent font-medium'
                                }`}
                        >
                            <span className={activeTab === tab.id ? 'opacity-100' : 'opacity-60 grayscale'}>
                                {tab.icon}
                            </span>
                            <span>{tab.name}</span>
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
                        Exit Protocol
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {tabs.find(t => t.id === activeTab)?.name}
                    </h1>
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">
                        {activeTab === 'dashboard' && 'Comprehensive system intelligence and ecosystem performance'}
                        {activeTab === 'inventory' && 'Universal catalog management and architectural inventory control'}
                        {activeTab === 'carts' && 'Full-spectrum observation of active procurement requested by users'}
                        {activeTab === 'users' && 'System-wide identity governance and role synchronization'}
                        {activeTab === 'margins' && 'Financial protocol configuration and markup logic control'}
                        {activeTab === 'settings' && 'Global framework parameters and core system preferences'}
                        {activeTab === 'emails' && 'Identity-branded communication matrices and templates'}
                        {activeTab === 'audit' && 'Temporal registry of system actions and security protocols'}
                    </p>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {activeTab === 'dashboard' && <DashboardOverview stats={stats} users={users} margins={margins} />}
                    {activeTab === 'inventory' && <InventoryManagement />}
                    {activeTab === 'carts' && (
                        selectedCartId ? (
                            <CartDetailView cartId={selectedCartId} onBack={() => setSelectedCartId(null)} />
                        ) : (
                            <CartManagement onViewDetails={setSelectedCartId} />
                        )
                    )}
                    {activeTab === 'users' && <UserManagement users={users} />}
                    {activeTab === 'margins' && <MarginManagement />}
                    {activeTab === 'settings' && <SystemSettings />}
                    {activeTab === 'emails' && <EmailTemplates />}
                    {activeTab === 'audit' && <AuditLogViewer />}
                </div>
            </main>
        </div>
    );
}

// Cart Management Component
function CartManagement({ onViewDetails }) {
    const { data: carts, isLoading } = useQuery({
        queryKey: ['admin-all-carts'],
        queryFn: () => cartAPI.getAll(),
    });

    if (isLoading) {
        return (
            <div className="p-20 text-center bg-white/80 backdrop-blur-md rounded-[3rem] border border-[#D4AF37]/10 shadow-2xl">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37] mx-auto"></div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-widest text-xs">Accessing global cart data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                {carts?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#D4AF37]/10">
                            <thead className="bg-[#F7E7CE]/20">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cart Identity</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Profile</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Items</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol Status</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Stamp</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interface</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4AF37]/5">
                                {carts.data.map((cart) => (
                                    <tr key={cart._id} className="hover:bg-[#F7E7CE]/10 transition-all group">
                                        <td className="px-6 py-6 font-medium">
                                            <div className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{cart.cartNumber}</div>
                                            <div className="text-[9px] text-gray-400 font-mono italic uppercase opacity-60">ID: {cart._id.substring(cart._id.length - 8)}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-[#D4AF37]/20">
                                                    {cart.userId?.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.name || 'Anonymous Entity'}</div>
                                                    <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{cart.userId?.company || 'Elite Individual'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[10px] font-black text-white bg-[#1A1A1A] px-3 py-1 rounded-full shadow-lg shadow-black/10 uppercase tracking-widest">
                                                {cart.items?.length || 0} Pieces
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-[#D4AF37]/10 ${cart.status === 'Quoted' ? 'bg-[#1A1A1A] text-white' :
                                                cart.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    cart.status === 'Under Review' ? 'bg-[#F7E7CE] text-[#D4AF37]' :
                                                        cart.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {cart.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-xs text-gray-500 font-semibold italic">
                                            {new Date(cart.submittedAt || cart.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button
                                                onClick={() => onViewDetails(cart._id)}
                                                className="inline-flex items-center px-6 py-2.5 bg-white border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                Examine Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-24 text-center">
                        <div className="text-6xl mb-6 opacity-20">🛒</div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No Operational History</h3>
                        <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">Registry is currently vacant of active carts</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Cart Detail View Component
function CartDetailView({ cartId, onBack }) {
    const { data: cartResponse, isLoading } = useQuery({
        queryKey: ['cart', cartId],
        queryFn: () => cartAPI.getById(cartId),
    });

    const cart = cartResponse?.data;

    if (isLoading) {
        return (
            <div className="p-20 text-center animate-pulse">
                <div className="h-16 w-16 bg-[#F7E7CE] rounded-full mx-auto mb-6 flex items-center justify-center">
                    <div className="h-8 w-8 bg-[#D4AF37] rounded-full animate-ping"></div>
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Exhuming cart intelligence...</p>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="p-20 text-center bg-white/80 backdrop-blur-md rounded-[3rem] border border-[#D4AF37]/10 shadow-2xl">
                <p className="text-[#1A1A1A] font-bold uppercase tracking-[0.2em] mb-4">Identity Void: Cart Not Found</p>
                <button onClick={onBack} className="text-[#D4AF37] font-black uppercase tracking-widest text-xs hover:underline">Return to Operational List</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Back Button & Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-[10px] font-black text-gray-400 hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-all group"
                >
                    <svg className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Regress to Collection
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Status</span>
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[#F7E7CE] text-[#D4AF37] border border-[#D4AF37]/20 shadow-sm ring-4 ring-[#F7E7CE]/50`}>
                        {cart.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Cart Info Summary */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-[#D4AF37]/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-2 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#B8941F] w-full opacity-30"></div>

                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tighter mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {cart.cartNumber}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.1em]">{cart._id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Temporal Registry</p>
                                <p className="text-sm font-bold text-[#D4AF37]">
                                    {new Date(cart.submittedAt || cart.createdAt).toLocaleDateString(undefined, {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border border-[#D4AF37]/5 rounded-[2rem] overflow-hidden bg-[#FAFAF8]/50">
                            <table className="min-w-full divide-y divide-[#D4AF37]/5">
                                <thead className="bg-[#F7E7CE]/10">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Item Asset</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Units</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Review</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Channel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D4AF37]/5">
                                    {cart.items.map((item) => (
                                        <tr key={item._id} className="hover:bg-[#F7E7CE]/5 transition-all group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#D4AF37]/10 bg-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 bg-gray-50 uppercase">🖼️</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 mt-1">{item.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-lg font-bold text-[#1A1A1A] italic" style={{ fontFamily: "'Playfair Display', serif" }}>x{item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.reviewStatus === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    item.reviewStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        item.reviewStatus === 'Sourcing' ? 'bg-[#1A1A1A] text-white' :
                                                            'bg-[#F7E7CE] text-[#D4AF37] border-[#D4AF37]/10'
                                                    }`}>
                                                    {item.reviewStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <span className="text-[9px] font-black text-[#D4AF37] bg-white border border-[#D4AF37]/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                                    {item.sourceType}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Customer Info Card */}
                <div className="space-y-8">
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-[#D4AF37]/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7E7CE]/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#D4AF37]/10 transition-all duration-1000"></div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Client Identity</h3>
                        <div className="flex items-center gap-6 mb-10">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-[#D4AF37]/30 ring-4 ring-white border border-[#D4AF37]/20">
                                {cart.userId?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.name}</p>
                                <p className="text-[11px] text-[#D4AF37] font-black uppercase tracking-widest mt-2">Verified Partner</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="p-5 bg-[#FAFAF8] rounded-2xl border border-[#D4AF37]/5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Affiliation</p>
                                <p className="text-sm font-bold text-[#1A1A1A] italic" style={{ fontFamily: "'Playfair Display', serif" }}>{cart.userId?.company || 'Independent Collector'}</p>
                            </div>
                            <div className="p-5 bg-[#FAFAF8] rounded-2xl border border-[#D4AF37]/5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Digital Frequency</p>
                                <p className="text-sm font-bold text-[#1A1A1A]/70 lowercase">{cart.userId?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Team Interaction */}
                    <div className="bg-[#1A1A1A] rounded-[2.5rem] p-10 border border-white/10 shadow-3xl text-white">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">Ecosystem Consensus</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sales Validation</span>
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Authorized</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hub Synchronization</span>
                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dashboard Overview Component
function DashboardOverview({ stats, users, margins }) {
    return (
        <div className="space-y-10">
            {/* Stats Grid - Matching Sales Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7E7CE]/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#D4AF37]/10 transition-all duration-700"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Total Registry</p>
                    <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {users?.data?.length || 0}
                    </p>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7E7CE]/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#D4AF37]/10 transition-all duration-700"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Active Carts</p>
                    <p className="text-4xl font-bold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {stats?.data?.activeCarts || 0}
                    </p>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-green-100/10 transition-all duration-700"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Quotations</p>
                    <p className="text-4xl font-bold text-green-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {stats?.data?.quotations || 0}
                    </p>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4AF37]/10 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#1A1A1A]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#1A1A1A]/10 transition-all duration-700"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Inventory Items</p>
                    <p className="text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {stats?.data?.inventoryItems || 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Recent Activity */}
                <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>Temporal Activity</h3>
                        <span className="text-[9px] font-black text-[#D4AF37] bg-gradient-to-r from-[#F7E7CE] to-white px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#D4AF37]/20 shadow-sm ring-4 ring-[#F7E7CE]/30">Real-time Pulse</span>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start gap-6 p-6 bg-[#FAFAF8] rounded-[2rem] border border-[#D4AF37]/5 hover:border-[#D4AF37]/20 hover:bg-white transition-all group cursor-default">
                            <span className="text-3xl bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg border border-[#D4AF37]/10 group-hover:rotate-6 transition-transform">📦</span>
                            <div>
                                <p className="text-base font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>Strategic Inventory Entry</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest italic opacity-70">Automated Intelligence Sync • 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6 p-6 bg-[#FAFAF8] rounded-[2rem] border border-[#D4AF37]/5 hover:border-[#D4AF37]/20 hover:bg-white transition-all group cursor-default">
                            <span className="text-3xl bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg border border-[#D4AF37]/10 group-hover:-rotate-6 transition-transform">👤</span>
                            <div>
                                <p className="text-base font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>Identity Registration Success</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest italic opacity-70">Internal Governance Verified • 5 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-[#1A1A1A] p-10 rounded-[3rem] shadow-3xl border border-white/10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full -ml-20 -mt-20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] mb-12">Role Synchronization</h3>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/item cursor-default">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-5 shadow-[0_0_12px_rgba(59,130,246,0.5)] group-hover/item:scale-150 transition-transform"></span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">External Partners</span>
                            </div>
                            <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {users?.data?.filter(u => u.role === 'External').length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/item cursor-default">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-5 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover/item:scale-150 transition-transform"></span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Sales Hub</span>
                            </div>
                            <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {users?.data?.filter(u => u.role === 'Sales').length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/item cursor-default">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] mr-5 shadow-[0_0_12px_rgba(212,175,55,0.5)] group-hover/item:scale-150 transition-transform"></span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Sourcing Hub</span>
                            </div>
                            <span className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {users?.data?.filter(u => u.role === 'Sourcing').length || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// User Management Component
function UserManagement({ users }) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>Active Identities</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mt-1">Configure system roles and architectural access protocols</p>
                </div>
                <button className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl active:scale-95 transition-all outline-none border border-white/10">
                    + Register Strategic Identity
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 overflow-hidden">
                {users?.data?.length > 0 ? (
                    <div className="divide-y divide-[#D4AF37]/5">
                        {users.data.map((u) => (
                            <div key={u._id} className="p-8 hover:bg-[#F7E7CE]/10 transition-all group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-[#FAFAF8] border border-[#D4AF37]/10 flex items-center justify-center text-2xl font-black text-gray-300 group-hover:bg-[#1A1A1A] group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                                            {u.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>{u.name}</h3>
                                            <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.1em] mt-1">{u.email} <span className="mx-2 text-gray-300">|</span> <span className="text-gray-400 italic">{u.company || 'Direct Partner'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${u.role === 'Admin' ? 'bg-[#1A1A1A] text-white border-transparent' :
                                            u.role === 'Sales' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                'bg-[#F7E7CE] text-[#D4AF37] border-[#D4AF37]/10'
                                            }`}>
                                            {u.role}
                                        </span>
                                        <div className="flex items-center gap-3 bg-[#FAFAF8] px-4 py-2 rounded-xl border border-[#D4AF37]/5">
                                            <span className={`h-2.5 w-2.5 rounded-full ${u.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-300'}`}></span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{u.isActive ? 'Active' : 'Offline'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">Registry is currently vacant</div>
                )}
            </div>
        </div>
    );
}
