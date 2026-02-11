import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import quotationAPI from '../../api/quotation';
import Sidebar from '../../components/Sidebar';

export default function QuotationList() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('');

    const { data: response, isLoading } = useQuery({
        queryKey: ['quotations', { status: statusFilter }],
        queryFn: () => quotationAPI.getAll({ status: statusFilter }),
    });

    const quotations = response?.data || [];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Draft': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'Sent': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'Revised': return 'bg-[#F7E7CE]/50 text-[#B8941F] border-[#D4AF37]/20';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex text-[#1A1A1A]">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F7E7CE] border-t-[#D4AF37]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex text-[#1A1A1A]">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Elegant Header */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-bold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            My Quotations
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Review and manage your custom jewelry procurement proposals and valuation matrices.
                        </p>
                    </div>

                    <div className="flex gap-4 p-1.5 bg-white/70 backdrop-blur-md border border-[#D4AF37]/10 rounded-2xl shadow-xl shadow-black/5">
                        <button
                            onClick={() => setStatusFilter('')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === ''
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white shadow-lg shadow-[#D4AF37]/20'
                                : 'text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50'
                                }`}
                        >
                            All
                        </button>
                        {['Sent', 'Approved', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status
                                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white shadow-lg shadow-[#D4AF37]/20'
                                    : 'text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Proposals Grid */}
                {quotations.length === 0 ? (
                    <div className="p-32 text-center bg-white/80 backdrop-blur-md rounded-[3rem] border border-[#D4AF37]/10 shadow-2xl">
                        <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl border border-[#D4AF37]/10 flex items-center justify-center mb-10 mx-auto">
                            <svg className="w-14 h-14 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Empty Portfolio</h2>
                        <p className="text-xl text-gray-400 max-w-sm mx-auto italic leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No proposals have been generated for your active sourcing sessions yet. Please check back as sourcing matures.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {quotations.map((quote) => (
                            <div
                                key={quote._id}
                                onClick={() => navigate(`/quotations/${quote._id}`)}
                                className="group bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-[#D4AF37]/10 shadow-xl shadow-black/5 hover:shadow-2xl hover:border-[#D4AF37]/40 transition-all duration-500 relative overflow-hidden flex flex-col cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7E7CE]/10 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-gradient-to-br from-[#1A1A1A] to-[#333333] rounded-2xl shadow-lg border border-white/5">
                                        <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </div>

                                <div className="mb-8">
                                    <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mb-2 leading-none">Proposal Signature</p>
                                    <h3 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {quote.quotationNumber}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-mono italic opacity-60">REF: {quote._id.substring(18).toUpperCase()}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#D4AF37]/5">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 leading-none">Modules</p>
                                        <p className="text-xl font-bold text-[#1A1A1A]">{quote.lineItems?.length || 0} Pieces</p>
                                    </div>
                                    <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#D4AF37]/5">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 leading-none">Protocol Date</p>
                                        <p className="text-sm font-bold text-[#1A1A1A]">{new Date(quote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-[#D4AF37]/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 leading-none">Estimated Valuation</p>
                                        <p className="text-3xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            ₹{(quote.grandTotal || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-[#FAFAF8] rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#D4AF37] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
