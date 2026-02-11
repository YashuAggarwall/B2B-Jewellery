import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

export default function SystemSettings() {
    const queryClient = useQueryClient();
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    const { data: settingsResponse, isLoading, error } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: adminAPI.getSettings,
    });

    const updateMutation = useMutation({
        mutationFn: ({ key, value }) => adminAPI.updateSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-settings']);
            toast.success('Setting updated successfully');
            setEditingKey(null);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update setting');
        }
    });

    const handleEdit = (setting) => {
        setEditingKey(setting.key);
        setEditValue(typeof setting.value === 'boolean' ? setting.value.toString() : setting.value.toString());
    };

    const handleSave = (key) => {
        let value = editValue;
        const ArrayData = Array.isArray(settingsResponse?.data) ? settingsResponse.data : [];
        const original = ArrayData.find(s => s.key === key);
        if (!original) return;

        if (typeof original.value === 'boolean') {
            value = editValue === 'true';
        } else if (typeof original.value === 'number') {
            value = Number(editValue);
        }

        updateMutation.mutate({ key, value });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading platform settings...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error fetching settings: {error.message}</div>;

    const settings = Array.isArray(settingsResponse?.data) ? settingsResponse.data : [];
    if (settings.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Settings Found</h3>
                <p className="text-sm text-gray-500">The system configuration database is currently empty. Run the seed script to populate defaults.</p>
            </div>
        );
    }

    const categories = ['General', 'Pricing', 'API', 'Communication'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {categories.map(category => {
                const categorySettings = settings.filter(s => s.category === category);
                if (categorySettings.length === 0) return null;

                return (
                    <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{category} Settings</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {categorySettings.map(setting => (
                                <div key={setting.key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-900">{setting.key.replace(/_/g, ' ').toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-400 font-mono italic">({setting.key})</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{setting.description}</p>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-[300px] justify-end">
                                        {editingKey === setting.key ? (
                                            <div className="flex items-center gap-2 w-full">
                                                {typeof setting.value === 'boolean' ? (
                                                    <select
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                                    >
                                                        <option value="true">Enabled</option>
                                                        <option value="false">Disabled</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                                    />
                                                )}
                                                <button
                                                    onClick={() => handleSave(setting.key)}
                                                    disabled={updateMutation.isLoading}
                                                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingKey(null)}
                                                    className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`px-4 py-1.5 rounded-lg text-sm font-black border ${typeof setting.value === 'boolean'
                                                    ? (setting.value ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100')
                                                    : 'bg-primary-50 text-primary-700 border-primary-100'
                                                    }`}>
                                                    {typeof setting.value === 'boolean' ? (setting.value ? 'Active' : 'Disabled') : setting.value.toString()}
                                                </div>
                                                <button
                                                    onClick={() => handleEdit(setting)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
