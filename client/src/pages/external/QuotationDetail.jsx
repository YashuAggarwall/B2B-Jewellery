import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import quotationAPI from '../../api/quotation';
import Sidebar from '../../components/Sidebar';
import CommunicationPanel from '../../components/CommunicationPanel';

export default function QuotationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCommOpen, setIsCommOpen] = useState(false);

    const { data: response, isLoading } = useQuery({
        queryKey: ['quotation', id],
        queryFn: () => quotationAPI.getById(id),
    });

    const approveMutation = useMutation({
        mutationFn: () => quotationAPI.approve(id),
        onSuccess: () => {
            toast.success('Protocol Executed! Sourcing lifecycle initiated.');
            queryClient.invalidateQueries(['quotation', id]);
            queryClient.invalidateQueries(['quotations']);
        },
        onError: (error) => toast.error(error.message || 'Execution failed'),
    });

    const rejectMutation = useMutation({
        mutationFn: (reason) => quotationAPI.reject(id, reason),
        onSuccess: () => {
            toast.success('Proposal Decommissioned.');
            queryClient.invalidateQueries(['quotation', id]);
            queryClient.invalidateQueries(['quotations']);
        },
        onError: (error) => toast.error(error.message || 'Decommissioning failed'),
    });

    const quotation = response?.data;

    const handleReject = () => {
        const reason = window.prompt('Provide decommissioning rationale (optional):');
        if (reason !== null) {
            rejectMutation.mutate(reason);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Draft': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'Sent': return 'bg-[#1A1A1A] text-white border-transparent shadow-lg shadow-black/10';
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'Revised': return 'bg-[#F7E7CE]/50 text-[#B8941F] border-[#D4AF37]/20';
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

    if (!quotation) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex">
                <Sidebar />
                <div className="flex-1 ml-64 p-24 text-center">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border border-[#D4AF37]/10 flex items-center justify-center mb-8 mx-auto grayscale opacity-50">
                        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4 uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Proposal Not Found</h2>
                    <button onClick={() => navigate('/quotations')} className="text-[#D4AF37] font-black uppercase text-[10px] tracking-[0.3em] hover:tracking-[0.4em] transition-all">
                        Return to Registry
                    </button>
                </div>
            </div>
        );
    }

    const isActionable = quotation.status === 'Sent';

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 max-w-6xl mx-auto">
                {/* Navigation back */}
                <button
                    onClick={() => navigate('/quotations')}
                    className="mb-10 flex items-center gap-3 text-gray-400 hover:text-[#D4AF37] font-black uppercase text-[10px] tracking-[0.3em] transition-all group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                    Proposal Index
                </button>

                <div className="bg-white/90 backdrop-blur-md rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-[#D4AF37]/10 overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Header with status */}
                    <div className="bg-gradient-to-br from-[#FAFAF8] to-white p-12 lg:p-16 border-b border-[#D4AF37]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="text-[9px] font-mono font-black text-[#B8941F] bg-[#F7E7CE]/30 border border-[#D4AF37]/20 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                                    ID: {quotation.quotationNumber}
                                </span>
                                <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusStyle(quotation.status)}`}>
                                    {quotation.status}
                                </span>
                                <button
                                    onClick={() => quotationAPI.downloadPdf(quotation._id)}
                                    className="px-5 py-2 bg-white border border-[#D4AF37]/10 text-gray-500 font-black rounded-xl hover:bg-[#FAFAF8] hover:text-[#D4AF37] transition-all uppercase text-[8px] tracking-[0.2em] shadow-sm flex items-center gap-2 group/dl"
                                >
                                    <svg className="w-3.5 h-3.5 group-hover/dl:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export Ledger (PDF)
                                </button>
                            </div>
                            <h2 className="text-6xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Deployment Quote</h2>
                        </div>

                        {isActionable && (
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleReject}
                                    disabled={rejectMutation.isPending}
                                    className="px-8 py-5 bg-white border border-[#D4AF37]/20 text-red-600 font-black rounded-[2rem] hover:bg-red-50 hover:border-red-100 transition-all uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-black/5 active:scale-95 disabled:opacity-50"
                                >
                                    Decommission
                                </button>
                                <button
                                    onClick={() => approveMutation.mutate()}
                                    disabled={approveMutation.isPending}
                                    className="px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-black rounded-[2rem] hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all uppercase text-[9px] tracking-[0.3em] shadow-xl disabled:opacity-50"
                                >
                                    Initialize Execution
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-10 lg:p-16">
                        <div className="overflow-x-auto">
                            <table className="w-full mb-16">
                                <thead>
                                    <tr className="border-b border-[#D4AF37]/10">
                                        <th className="text-left pb-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocol Components</th>
                                        <th className="text-center pb-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Quantum</th>
                                        <th className="text-right pb-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Unit Value</th>
                                        <th className="text-right pb-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Aggregated Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D4AF37]/5">
                                    {quotation.lineItems.map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-10 pr-6">
                                                <p className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{item.category}</p>
                                                {item.customizationNotes && (
                                                    <div className="mt-4 p-4 bg-[#F7E7CE]/20 rounded-2xl border border-[#D4AF37]/10 inline-block">
                                                        <p className="text-[10px] text-[#B8941F] font-bold italic uppercase tracking-tighter" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Protocol Parameter: "{item.customizationNotes}"</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-10 text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAFAF8] border border-[#D4AF37]/5 text-sm font-black text-gray-400">
                                                    {item.quantity}
                                                </div>
                                            </td>
                                            <td className="py-10 text-right text-base font-medium text-gray-900">₹{item.unitPrice.toLocaleString()}</td>
                                            <td className="py-10 text-right text-2xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>₹{item.totalPrice.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between gap-16 pt-16 border-t border-[#D4AF37]/10">
                            <div className="max-w-md w-full">
                                <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-8">Deployment Configuration</h4>
                                <div className="bg-[#FAFAF8] rounded-[2.5rem] p-10 text-lg text-gray-600 leading-relaxed font-medium italic border border-[#D4AF37]/5 shadow-inner" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    "{quotation.notes || "Standard procurement protocols active. No bespoke configurations initialized."}"
                                </div>
                            </div>

                            <div className="max-w-md w-full ml-auto">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                        <span>Subtotal Asset Mass</span>
                                        <span className="text-[#1A1A1A] font-bold">₹{quotation.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                        <span>Insurance & Logistics</span>
                                        <span className="text-emerald-600 italic font-bold">Elite Tier Inbound</span>
                                    </div>
                                    <div className="pt-10 mt-10 border-t-2 border-[#D4AF37]/10 flex justify-between items-center">
                                        <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Integrated Valuation</span>
                                        <span className="text-5xl font-bold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            ₹{quotation.grandTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center gap-4 text-[9px] text-gray-300 font-bold uppercase tracking-[0.5em] justify-end opacity-60">
                                    <div className="w-12 h-px bg-gray-200"></div>
                                    <span>VALID THROUGH: {new Date(quotation.validUntil).toLocaleDateString().toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <CommunicationPanel
                contextType="Quotation"
                contextId={id}
                isOpen={isCommOpen}
                onClose={() => setIsCommOpen(false)}
            />

            {/* Premium Support Trigger */}
            <button
                onClick={() => setIsCommOpen(true)}
                className="fixed bottom-12 right-12 w-20 h-20 bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#D4AF37] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border border-[#D4AF37]/30"
            >
                <svg className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <div className="absolute right-full mr-6 px-5 py-2.5 bg-white border border-[#D4AF37]/20 text-[#1A1A1A] text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap shadow-2xl pointer-events-none">
                    Protocol Signal (Sales)
                </div>
            </button>
        </div>
    );
}
