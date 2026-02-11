import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CommunicationPanel({ contextType, contextId, isOpen, onClose }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);

    const { data: conversationResponse, isLoading } = useQuery({
        queryKey: ['communication', contextType, contextId],
        queryFn: () => messageAPI.getConversation(contextType, contextId),
        enabled: isOpen && !!contextId,
        refetchInterval: 5000, // Poll every 5 seconds for basic "real-time"
    });

    const sendMutation = useMutation({
        mutationFn: (content) => messageAPI.sendMessage({
            content,
            contextType,
            contextId
        }),
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries(['communication', contextType, contextId]);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to send message');
        }
    });

    const markReadMutation = useMutation({
        mutationFn: () => messageAPI.markAsRead(contextType, contextId),
    });

    useEffect(() => {
        if (isOpen && contextId) {
            markReadMutation.mutate();
        }
    }, [isOpen, contextId, conversationResponse]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversationResponse]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMutation.mutate(newMessage);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Customer Communication</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{contextType} #{contextId.slice(-6)}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-white"
            >
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : conversationResponse?.data?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">💬</div>
                        <p className="text-sm text-gray-400 font-medium">No messages yet.<br />Start the conversation!</p>
                    </div>
                ) : (
                    conversationResponse?.data?.map((msg) => {
                        const isMe = msg.senderId._id === user?.id;
                        return (
                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                                    }`}>
                                    {!isMe && (
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                                            {msg.senderId.name} ({msg.senderId.role})
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm font-medium"
                    />
                    <button
                        type="submit"
                        disabled={sendMutation.isLoading || !newMessage.trim()}
                        className="absolute right-2 top-1.5 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
