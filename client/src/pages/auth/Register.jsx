import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] relative overflow-hidden flex items-center justify-center p-4">
            {/* Elegant Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#D4AF37] blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#F7E7CE] blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Brand Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8941F] p-3 rounded-xl shadow-lg shadow-[#D4AF37]/20 mb-4 transition-transform hover:rotate-12 duration-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Join The Hub
                    </h1>
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">Exclusive B2B Jewellery Network</p>
                </div>

                {/* Register Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/5 border border-[#D4AF37]/10 p-8 relative overflow-hidden group">
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all placeholder:text-gray-300 text-sm"
                                placeholder="e.g. Alexander Noble"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all placeholder:text-gray-300 text-sm"
                                    placeholder="you@luxury.com"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all placeholder:text-gray-300 text-sm"
                                    placeholder="+91..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all placeholder:text-gray-300 text-sm"
                                placeholder="Elegant Jewels Ltd."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#FAFAF8] border border-[#D4AF37]/10 rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all placeholder:text-gray-300 text-sm"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white py-4 rounded-xl font-bold tracking-widest uppercase text-xs shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Creating Account...' : 'Initialize Membership'}
                        </button>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <p className="text-xs text-gray-500 font-medium">
                            Already a member?{' '}
                            <Link to="/login" className="text-[#D4AF37] font-bold hover:underline underline-offset-4 decoration-[#D4AF37]/30 transition-all">
                                Sign In Here
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
                    By joining, you agree to our <span className="text-gray-600 font-bold hover:text-[#D4AF37] cursor-pointer">Terms of Excellence</span>
                </p>
            </div>
        </div>
    );
}
