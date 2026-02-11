import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SourcingSidebar({ activeTab, onTabChange }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        {
            id: 'queue',
            name: 'Validation Queue',
            path: '/sourcing/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            id: 'assigned',
            name: 'My Assignments',
            path: '/sourcing/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            id: 'all',
            name: 'All Hub Carts',
            path: '/sourcing/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            ),
        },
        {
            id: 'manufacturers',
            name: 'Manufacturers',
            path: '/sourcing/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
    ];

    return (
        <aside className="w-64 bg-gradient-to-b from-white to-[#FAFAF8] border-r border-[#D4AF37]/20 flex flex-col fixed inset-y-0 shadow-xl z-20">
            {/* Premium Header */}
            <div className="p-6 border-b border-[#D4AF37]/20 bg-gradient-to-br from-[#F7E7CE]/30 to-white">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] p-2.5 rounded-xl shadow-lg shadow-[#D4AF37]/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Sourcing Hub
                    </h2>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isTabActive = activeTab === item.id;
                    const isPathActive = location.pathname === item.path && !activeTab;
                    const isActive = isTabActive || isPathActive;

                    if (onTabChange && item.path === '/sourcing/dashboard') {
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F7E7CE]/30 text-[#D4AF37] shadow-md shadow-[#D4AF37]/10 border border-[#D4AF37]/20 font-semibold'
                                    : 'text-gray-600 hover:bg-[#F7E7CE]/20 hover:text-[#1A1A1A] border border-transparent font-medium'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.id}
                            to={item.id === 'manufacturers' ? '/sourcing/dashboard?tab=manufacturers' : item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F7E7CE]/30 text-[#D4AF37] shadow-md shadow-[#D4AF37]/10 border border-[#D4AF37]/20 font-semibold'
                                : 'text-gray-600 hover:bg-[#F7E7CE]/20 hover:text-[#1A1A1A] border border-transparent font-medium'
                                }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
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
    );
}
