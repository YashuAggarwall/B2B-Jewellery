import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Cart History',
            path: '/cart-history',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        },
        {
            name: 'My Quotations',
            path: '/quotations',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        External Hub
                    </h2>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F7E7CE]/30 text-[#D4AF37] shadow-md shadow-[#D4AF37]/10 border border-[#D4AF37]/20 font-semibold'
                                : 'text-gray-600 hover:bg-[#F7E7CE]/20 hover:text-[#1A1A1A] border border-transparent font-medium'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
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
    );
}
