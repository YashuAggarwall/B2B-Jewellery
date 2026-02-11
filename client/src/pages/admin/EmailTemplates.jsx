import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

export default function EmailTemplates() {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editForm, setEditForm] = useState({ subject: '', body: '' });

    const { data: templatesResponse, isLoading, error } = useQuery({
        queryKey: ['admin-templates'],
        queryFn: adminAPI.getEmailTemplates,
    });

    const updateMutation = useMutation({
        mutationFn: (data) => adminAPI.updateEmailTemplate(selectedTemplate._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-templates']);
            toast.success('Template updated successfully');
            setSelectedTemplate(null);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update template');
        }
    });

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setEditForm({
            subject: template.subject,
            body: template.body
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        updateMutation.mutate(editForm);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading templates...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error fetching templates: {error.message}</div>;

    const hasData = templatesResponse?.data?.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!hasData ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                    <div className="text-4xl mb-4">📧</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Email Templates Found</h3>
                    <p className="text-sm text-gray-500">The email template database is currently empty. Run the seed script to populate defaults.</p>
                </div>
            ) : selectedTemplate ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Editing: {selectedTemplate.name}</h3>
                        <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>
                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subject Line</label>
                            <input
                                type="text"
                                value={editForm.subject}
                                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Body (HTML Supported)</label>
                            <textarea
                                value={editForm.body}
                                onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                                rows={10}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono"
                                required
                            />
                        </div>

                        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                            <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Available Placeholders</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedTemplate.placeholders.map(p => (
                                    <span key={p} className="bg-white px-2 py-1 rounded border border-primary-200 text-[10px] font-mono font-bold text-primary-700">
                                        {`{{${p}}}`}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedTemplate(null)}
                                className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateMutation.isLoading}
                                className="bg-primary-600 text-white px-8 py-2 rounded-xl text-sm font-black hover:bg-primary-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updateMutation.isLoading ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templatesResponse?.data?.map(template => (
                        <div key={template._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{template.name}</h3>
                                    <p className="text-xs text-gray-400 italic mt-1">{template.description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${template.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                    {template.isActive ? 'Active' : 'Disabled'}
                                </span>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject Preview</p>
                                <p className="text-sm font-bold text-gray-700 truncate">{template.subject}</p>
                            </div>

                            <button
                                onClick={() => handleEdit(template)}
                                className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                            >
                                Edit Template
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
