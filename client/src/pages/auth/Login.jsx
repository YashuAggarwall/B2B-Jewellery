import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(email, password);

            // Redirect based on role
            switch (user.role) {
                case 'External':
                    navigate('/dashboard');
                    break;
                case 'Sales':
                    navigate('/sales/dashboard');
                    break;
                case 'Sourcing':
                    navigate('/sourcing/dashboard');
                    break;
                case 'Admin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] relative overflow-hidden flex items-center justify-center p-4">
            {/* Elegant Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D4AF37] blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#F7E7CE] blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Brand Logo & Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8941F] p-4 rounded-2xl shadow-xl shadow-[#D4AF37]/20 mb-6 group transition-transform hover:scale-105 duration-500">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        B2B Jewellery Sourcing
                    </h1>
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">The Pinnacle of Luxury Trade</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 p-10 relative overflow-hidden group">
                    {/* Interior Gradient Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F7E7CE]/20 rounded-full blur-3xl transition-all duration-700 group-hover:bg-[#D4AF37]/10"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Email</label>
                            <div className="relative group/input">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-4 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all placeholder:text-gray-300"
                                    placeholder="Enter your email address"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                                    ✨
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Password</label>
                                <a href="#" className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider hover:opacity-70 transition-opacity">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-2xl px-5 py-4 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all placeholder:text-gray-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-sm shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? 'Authorizing...' : 'Sign In To Hub'}
                                {!loading && (
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 text-center relative z-10">
                        <p className="text-sm text-gray-500 font-medium">
                            First time with us?{' '}
                            <Link to="/register" className="text-[#D4AF37] font-bold hover:underline underline-offset-4 decoration-[#D4AF37]/30 transition-all">
                                Request Access
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Accounts - Styled Elegantly */}
                <div className="mt-10 p-6 rounded-3xl bg-[#F7E7CE]/10 border border-[#D4AF37]/5">
                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] text-center mb-4">Quick Access Presets</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => { setEmail('external@demo.com'); setPassword('password123'); }}
                            className="text-[10px] font-bold text-gray-500 bg-white/50 hover:bg-white hover:text-[#D4AF37] py-2 px-3 rounded-xl border border-[#D4AF37]/5 transition-all text-left"
                        >
                            <span className="block text-gray-400 font-black mb-0.5 uppercase tracking-tighter">External Client</span>
                            external@demo.com
                        </button>
                        <button
                            onClick={() => { setEmail('sales@demo.com'); setPassword('password123'); }}
                            className="text-[10px] font-bold text-gray-500 bg-white/50 hover:bg-white hover:text-[#D4AF37] py-2 px-3 rounded-xl border border-[#D4AF37]/5 transition-all text-left"
                        >
                            <span className="block text-gray-400 font-black mb-0.5 uppercase tracking-tighter">Sales Representative</span>
                            sales@demo.com
                        </button>
                        <button
                            onClick={() => { setEmail('admin@demo.com'); setPassword('password123'); }}
                            className="text-[10px] font-bold text-gray-500 bg-white/50 hover:bg-white hover:text-[#D4AF37] py-2 px-3 rounded-xl border border-[#D4AF37]/5 transition-all text-left"
                        >
                            <span className="block text-gray-400 font-black mb-0.5 uppercase tracking-tighter">Internal Admin</span>
                            admin@demo.com
                        </button>
                        <button
                            onClick={() => { setEmail('sourcing@demo.com'); setPassword('password123'); }}
                            className="text-[10px] font-bold text-gray-500 bg-white/50 hover:bg-white hover:text-[#D4AF37] py-2 px-3 rounded-xl border border-[#D4AF37]/5 transition-all text-left"
                        >
                            <span className="block text-gray-400 font-black mb-0.5 uppercase tracking-tighter">Sourcing Expert</span>
                            sourcing@demo.com
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
