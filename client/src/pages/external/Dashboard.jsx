import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { imageAPI, recommendationAPI, cartAPI } from '../../utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';

export default function ExternalDashboard() {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const queryClient = useQueryClient();

    // Fetch user's cart
    const { data: cart } = useQuery({
        queryKey: ['cart'],
        queryFn: cartAPI.get,
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await imageAPI.upload(formData);
            const session = response.data;

            const recResponse = await recommendationAPI.generate(session._id);
            setRecommendations(recResponse.data.recommendations);

            toast.success('Image processed successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to process image');
        } finally {
            setUploading(false);
        }
    };

    const addToCartMutation = useMutation({
        mutationFn: cartAPI.addItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Added to collection!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add to collection');
        },
    });

    const submitCartMutation = useMutation({
        mutationFn: cartAPI.submit,
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Collection submitted successfully!');
            setRecommendations(null);
            setSelectedFile(null);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to submit collection');
        },
    });

    const handleAddToCart = (recommendation) => {
        addToCartMutation.mutate({
            recommendationId: recommendation.recommendationId,
            quantity: 1,
            productDetails: recommendation,
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Elegant Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-5xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.02em' }}>
                                Discover Your Perfect Match
                            </h1>
                            <p className="text-lg text-gray-600" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Upload your jewelry design and let our AI find the finest pieces from our curated collection
                            </p>
                        </div>

                        {/* Elegant Stats Card */}
                        <div className="bg-gradient-to-br from-[#F7E7CE] to-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-lg shadow-[#D4AF37]/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] p-3 rounded-xl">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Your Collection</p>
                                    <p className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>{cart?.data?.items?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Visual Search */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Luxury Upload Zone */}
                        <div className="bg-white rounded-3xl shadow-xl border border-[#D4AF37]/10 p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-8 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></div>
                                <h2 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Visual Search
                                </h2>
                            </div>

                            {!selectedFile ? (
                                <label htmlFor="image-upload" className="group relative block border-2 border-dashed border-[#D4AF37]/30 rounded-3xl p-16 text-center hover:border-[#D4AF37] hover:bg-[#F7E7CE]/20 transition-all duration-300 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center">
                                        {uploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#F7E7CE] border-t-[#D4AF37] mb-6"></div>
                                                <p className="text-[#D4AF37] font-bold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Analyzing your design...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37]/10 to-[#F7E7CE]/50 text-[#D4AF37] rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#D4AF37]/10">
                                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                    Upload Your Design
                                                </h3>
                                                <p className="text-gray-600 max-w-md mx-auto mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                                                    Our AI will analyze your jewelry and curate the finest matching pieces from our exclusive collection
                                                </p>
                                                <div className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300 hover:-translate-y-0.5 inline-block">
                                                    Select Image
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </label>
                            ) : (
                                <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/20 group">
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
                                                <p className="text-white font-bold">Processing...</p>
                                            </div>
                                        </div>
                                    )}
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Uploaded"
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setRecommendations(null);
                                        }}
                                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Luxury Recommendations */}
                        {recommendations && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Curated Matches
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#F7E7CE]/30 to-white">
                                                <img
                                                    src={rec.images?.[0] || rec.imageUrl || '/placeholder.jpg'}
                                                    alt={rec.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />

                                                {/* Elegant Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg ${rec.sourceType === 'Inventory' ? 'bg-emerald-500/90 text-white border-emerald-300/50' :
                                                        rec.sourceType === 'Manufacturer' ? 'bg-[#D4AF37]/90 text-white border-[#D4AF37]/50' :
                                                            'bg-gray-700/90 text-white border-gray-500/50'
                                                        }`}>
                                                        {rec.sourceType === 'Inventory' ? 'In Stock' :
                                                            rec.sourceType === 'Manufacturer' ? 'Artisan Crafted' :
                                                                rec.sourceType === 'External' ? 'Marketplace' :
                                                                    rec.type}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                    {rec.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 uppercase tracking-wider mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {rec.category}
                                                </p>

                                                <div className="flex items-baseline gap-2 mb-6">
                                                    <span className="text-3xl font-bold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                        ₹{rec.priceRange?.min?.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-gray-400">onwards</span>
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(rec)}
                                                    disabled={addToCartMutation.isPending}
                                                    className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Add to Collection
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Collection Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-gradient-to-br from-[#F7E7CE] to-[#FAFAF8] rounded-3xl border border-[#D4AF37]/20 shadow-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-8 bg-gradient-to-b from-[#D4AF37] to-[#B8941F] rounded-full"></div>
                                <h2 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Your Collection
                                </h2>
                            </div>

                            {cart?.data?.items?.length > 0 ? (
                                <>
                                    <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
                                        {cart.data.items.map((item) => (
                                            <div
                                                key={item._id}
                                                className="group relative bg-white rounded-2xl p-4 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#F7E7CE]/30 to-white flex-shrink-0 border border-[#D4AF37]/10">
                                                        <img
                                                            src={item.images?.[0] || item.imageUrl || '/placeholder.jpg'}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                                                            {item.category}
                                                        </p>
                                                        <p className="text-base font-bold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                            ₹{item.platformPriceRange?.min.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setItemToDelete(item)}
                                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => submitCartMutation.mutate()}
                                        disabled={submitCartMutation.isPending}
                                        className="w-full py-4 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        Submit Collection
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/10 to-[#F7E7CE]/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                                        Your collection is empty
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Start by uploading a design
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Elegant Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 border border-[#D4AF37]/10">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/10 to-[#F7E7CE]/50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        {/* Content */}
                        <h3 className="text-3xl font-bold text-[#1A1A1A] text-center mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Remove Item?
                        </h3>
                        <p className="text-gray-600 text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                            Are you sure you want to remove
                        </p>
                        <p className="text-gray-900 font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                            "{itemToDelete.name}"?
                        </p>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    cartAPI.removeItem(itemToDelete._id).then(() => {
                                        queryClient.invalidateQueries(['cart']);
                                        toast.success('Removed from collection');
                                        setItemToDelete(null);
                                    }).catch(() => {
                                        toast.error('Failed to remove item');
                                        setItemToDelete(null);
                                    });
                                }}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all duration-300"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
