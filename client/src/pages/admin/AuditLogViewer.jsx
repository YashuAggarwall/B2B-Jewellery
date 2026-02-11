import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';

export default function AuditLogViewer() {
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        status: '',
        page: 1,
        limit: 20
    });

    const { data: logResponse, isLoading } = useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: () => adminAPI.getAuditLogs(filters),
        keepPreviousData: true
    });

    const logs = logResponse?.data || [];
    const pagination = logResponse?.pagination || { total: 0, pages: 0, page: 1 };

    const [selectedLog, setSelectedLog] = useState(null);

    const getEntityIcon = (type) => {
        switch (type) {
            case 'User': return '👤';
            case 'Quotation': return '📜';
            case 'IntendedCart': return '🛒';
            case 'InventoryItem': return '📦';
            case 'ManufacturerSKU': return '🏭';
            case 'MarginConfig': return '💰';
            case 'SystemSettings': return '⚙️';
            default: return '📄';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entity Type</label>
                    <select
                        value={filters.entityType}
                        onChange={(e) => setFilters({ ...filters, entityType: e.target.value, page: 1 })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    >
                        <option value="">All Entities</option>
                        <option value="User">Users</option>
                        <option value="IntendedCart">Carts</option>
                        <option value="Quotation">Quotations</option>
                        <option value="InventoryItem">Inventory</option>
                        <option value="ManufacturerSKU">Manufacturer SKU</option>
                        <option value="MarginConfig">Margins</option>
                        <option value="SystemSettings">Settings</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>

                <button
                    onClick={() => setFilters({ action: '', entityType: '', status: '', page: 1, limit: 20 })}
                    className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                    Reset Filters
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User / Role</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action / Entity</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Trace</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-primary-50/20 transition-all group">
                                        <td className="px-6 py-5 text-xs font-bold text-gray-500 italic">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                    {log.userId?.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{log.userId?.name || 'System'}</p>
                                                    <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{log.userRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm shadow-sm group-hover:border-primary-100 transition-colors">
                                                    {getEntityIcon(log.entityType)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 tracking-tight">{log.action}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{log.entityType} • {log.entityId?.substring(18) || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${log.status === 'Success'
                                                    ? 'bg-green-50 text-green-700 border-green-100 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                                                    : 'bg-red-50 text-red-700 border-red-100 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="px-4 py-1.5 bg-white border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm active:scale-95"
                                            >
                                                View Source
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <p className="text-lg font-black text-gray-300 uppercase tracking-[0.2em]">No records found in current protocol</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing protocol {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} entries
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                Prev
                            </button>
                            <button
                                disabled={filters.page === pagination.pages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed View Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 w-full max-w-3xl overflow-hidden animate-slideUp">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">Audit Trace Details</h3>
                                <p className="text-[10px] font-black text-primary-600 tracking-widest uppercase opacity-70">GUID: {selectedLog._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-10 overflow-y-auto max-h-[60vh] space-y-8">
                            <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Metadata Context</p>
                                    <div className="space-y-2">
                                        <p className="text-sm flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">IP Sequence:</span> <span className="font-bold font-mono">{selectedLog.ipAddress || 'SYSTEM_INTERNAL'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-400">Agent String:</span> <span className="font-bold truncate max-w-[200px]" title={selectedLog.userAgent}>{selectedLog.userAgent || 'SECURE_NODE'}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entity Reference</p>
                                    <div className="space-y-2">
                                        <p className="text-sm flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">Protocol ID:</span> <span className="font-bold font-mono text-primary-600">{selectedLog.entityId || 'GLOBAL_REF'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-400">Action Path:</span> <span className="font-bold">{selectedLog.action}</span></p>
                                    </div>
                                </div>
                            </div>

                            {selectedLog.status === 'Failed' && selectedLog.errorMessage && (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
                                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Protocol Error Report</h4>
                                    <p className="text-sm font-bold text-red-800 font-mono break-all">{selectedLog.errorMessage}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Integrity Change Log</h4>
                                {selectedLog.changes ? (
                                    <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl overflow-x-auto border-t-8 border-primary-600">
                                        <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                            {JSON.stringify(selectedLog.changes, null, 4)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl opacity-50 italic">
                                        No structural changes registered for this session.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-10 border-t border-gray-50 flex justify-end bg-gray-50/30">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-8 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary-600 transition-all shadow-xl active:scale-95 shadow-gray-200"
                            >
                                Terminate Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
