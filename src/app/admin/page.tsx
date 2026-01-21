
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
    name: string;
    price: string;
    imageUrl: string;
    url: string;
}

export default function AdminPage() {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [savedProducts, setSavedProducts] = useState<Product[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Function to search/scrape
    const handleSearch = async () => {
        if (!keyword) return;
        setLoading(true);
        setSearchResults([]);
        setSelectedProduct(null);

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: keyword }), // Sending keyword as 'url' param for scraping
            });
            const data = await res.json();

            if (data.products && data.products.length > 0) {
                setSearchResults(data.products);
            } else {
                alert('검색 결과가 없습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // Function to Save product to DB
    const handleSave = async () => {
        if (!selectedProduct) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supporterId: 1, // Hardcoded for prototype
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    imageUrl: selectedProduct.imageUrl,
                    linkUrl: selectedProduct.url
                }),
            });
            const data = await res.json();
            if (data.product) {
                setSavedProducts([data.product, ...savedProducts]);
                setSelectedProduct(null);
                setSearchResults([]); // Clear search results after adding
                setKeyword('');
                alert('상품이 리스트에 추가되었습니다!');
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('저장 중 오류가 발생했습니다.');
        }
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SPAO Creator Studio</h1>
                    <p className="text-gray-500 mt-2">상품명이나 URL로 검색해서 리스트를 만들어보세요.</p>
                </header>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 sticky top-4 z-10">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="예: 데님 재킷, 슬랙스 (URL도 가능)"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 font-bold transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                            검색
                        </button>
                    </div>
                </div>

                {/* Search Results Grid */}
                <AnimatePresence>
                    {searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-10"
                        >
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h2 className="text-lg font-bold text-gray-900">검색 결과 <span className="text-blue-600">{searchResults.length}</span></h2>
                                {selectedProduct && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md animate-pulse flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        선택한 상품 추가하기
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {searchResults.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedProduct(item)}
                                        className={cn(
                                            "cursor-pointer group relative bg-white rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg",
                                            selectedProduct?.url === item.url ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2" : "border-transparent"
                                        )}
                                    >
                                        <div className="aspect-[3/4] bg-gray-100 relative">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            {selectedProduct?.url === item.url && (
                                                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                                    <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{item.name}</h3>
                                            <p className="text-gray-500 text-xs mt-1 font-medium">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Saved List Preview */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">등록된 리스트 <span className="text-gray-400 font-normal">({savedProducts.length})</span></h2>

                    <div className="grid grid-cols-1 gap-3">
                        {savedProducts.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover rounded-lg bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-gray-500 text-sm mt-0.5">{item.price}</p>
                                </div>
                            </div>
                        ))}
                        {savedProducts.length === 0 && searchResults.length === 0 && (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p>등록된 상품이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
