
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [savedProducts, setSavedProducts] = useState<any[]>([]);

    // Function to search/scrape product
    const handleSearch = async () => {
        if (!url) return;
        setLoading(true);
        setProduct(null);
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (data.product) {
                setProduct(data.product);
            } else {
                alert('상품 정보를 가져오지 못했습니다. URL을 확인해주세요.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // Function to "Save" product (Mock for now, would be DB call)
    const handleSave = async () => {
        if (!product) return;
        // In a real app, you would POST to /api/products
        setSavedProducts([...savedProducts, product]);
        setProduct(null);
        setUrl('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SPAO Creator Studio</h1>
                    <p className="text-gray-500 mt-2">나만의 추천 큐레이션을 만들어보세요.</p>
                </header>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="스파오 상품 URL을 입력하세요 (https://m.spao.com/...)"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                            검색
                        </button>
                    </div>

                    {/* Scraped Product Preview */}
                    {product && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 border border-blue-100 bg-blue-50/50 rounded-xl flex gap-4 items-start"
                        >
                            <img src={product.imageUrl} alt={product.name} className="w-24 h-32 object-cover rounded-lg shadow-sm bg-white" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-blue-600 mb-1">검색된 상품</p>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                                <p className="text-gray-600 font-medium">{product.price}</p>
                                <button
                                    onClick={handleSave}
                                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    내 리스트에 추가하기
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Saved List Preview */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">등록된 상품 리스트 <span className="text-gray-400 font-normal">({savedProducts.length})</span></h2>

                    <div className="grid grid-cols-1 gap-3">
                        {savedProducts.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover rounded-lg bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-gray-500 text-sm mt-0.5">{item.price}</p>
                                </div>
                                <div className="flex gap-2">
                                    <a href={item.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        ))}

                        {savedProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p>아직 등록된 상품이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
