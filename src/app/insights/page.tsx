
import { getTopKeywords, getMostClickedProducts, getMostSavedProducts } from '@/db/queries';
import { BarChart, Search, MousePointerClick, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
    const topKeywords = await getTopKeywords();
    const mostClicked = await getMostClickedProducts();
    const mostSaved = await getMostSavedProducts();

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <BarChart className="w-8 h-8 text-blue-600" />
                        SPAO Creator Insights
                    </h1>
                    <p className="text-gray-500 mt-2">서비스 이용 현황과 인기 트렌드를 한눈에 확인하세요.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* 1. Popular Search Keywords */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                            <Search className="w-5 h-5 text-purple-500" />
                            <h2 className="text-xl font-bold text-gray-900">인기 검색어 TOP 10</h2>
                        </div>
                        <ul className="space-y-3">
                            {topKeywords.map((log, idx) => (
                                <li key={log.keyword} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-medium text-gray-800">{log.keyword}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-purple-600 transition-colors">
                                        {log.count}회
                                    </span>
                                </li>
                            ))}
                            {topKeywords.length === 0 && <p className="text-center text-gray-400 py-4">데이터가 없습니다.</p>}
                        </ul>
                    </div>

                    {/* 2. Most Clicked Products */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                            <MousePointerClick className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-900">클릭이 많은 상품 (유저 반응)</h2>
                        </div>
                        <div className="space-y-4">
                            {mostClicked.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="relative">
                                        <img src={product.imageUrl} alt={product.name} className="w-12 h-16 object-cover rounded-lg bg-gray-100" />
                                        <span className={`absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${idx < 3 ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</div>
                                        <div className="text-xs text-gray-500">{product.price}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-lg font-black text-blue-600">{product.clickCount}</span>
                                        <span className="text-xs text-gray-400">clicks</span>
                                    </div>
                                </div>
                            ))}
                            {mostClicked.length === 0 && <p className="text-center text-gray-400 py-4">데이터가 없습니다.</p>}
                        </div>
                    </div>

                    {/* 3. Most Saved Products (Curators' Pick) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h2 className="text-xl font-bold text-gray-900">서포터즈들의 최애 아이템 (많이 등록됨)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mostSaved.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-yellow-50/50 transition-colors border border-transparent hover:border-yellow-100">
                                    <div className="relative">
                                        <img src={item.imageUrl || ''} alt={item.name} className="w-12 h-16 object-cover rounded-lg bg-gray-100" />
                                        <span className={`absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${idx < 3 ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</div>
                                    </div>
                                    <div className="text-right min-w-[60px]">
                                        <span className="block text-lg font-black text-gray-700">{item.count}</span>
                                        <span className="text-xs text-gray-400">times</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {mostSaved.length === 0 && <p className="text-center text-gray-400 py-4">데이터가 없습니다.</p>}
                    </div>

                </div>
            </div>
        </div>
    );
}
