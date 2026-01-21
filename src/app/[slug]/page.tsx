
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { getProductsBySupporterSlug, getSupporterBySlug } from '@/db/queries';
import { notFound } from 'next/navigation';

export default async function LinkTreePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const supporter = await getSupporterBySlug(slug);
    if (!supporter) {
        notFound();
    }

    const products = await getProductsBySupporterSlug(slug);

    return (
        <div className="min-h-screen bg-white">
            {/* Header Profile Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white pb-8 pt-12 px-6 flex flex-col items-center text-center border-b border-gray-100">
                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden ring-4 ring-white shadow-lg">
                    <img
                        src={supporter.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${supporter.name}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1 [word-break:keep-all]">@{supporter.name}</h1>
                <p className="text-gray-500 text-sm font-medium [word-break:keep-all] px-4">{supporter.description || "스파오의 힙한 아이템을 소개합니다 ✨"}</p>
            </div>

            {/* Product Grid */}
            <div className="max-w-md mx-auto px-4 py-8">
                <div className="grid grid-cols-2 gap-4">
                    {products.map((product, idx) => (
                        <a
                            key={idx}
                            href={product.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group block"
                        >
                            <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-[3/4] mb-3 relative">
                                {/* Placeholder mostly, if real image is broken */}
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                                    <ShoppingBag className="w-8 h-8 opacity-20" />
                                </div>
                                {/* In real usage, ensure image url is valid */}
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl flex flex-col items-end">
                                    {product.originalPrice && (
                                        <span className="text-[10px] text-gray-400 line-through decoration-gray-400 mb-px">{product.originalPrice}</span>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                                        {product.discountRate && (
                                            <span className="text-red-400 font-extrabold">{product.discountRate}%</span>
                                        )}
                                        <span className="font-bold">{product.price}</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {product.name}
                            </h3>
                        </a>
                    ))}

                    {products.length === 0 && (
                        <div className="col-span-2 text-center py-20 text-gray-400">
                            등록된 상품이 아직 없습니다.
                        </div>
                    )}
                </div>
            </div>

            <footer className="py-8 text-center text-gray-300 text-xs text-uppercase tracking-widest">
                SPAO LINKTREE
            </footer>
        </div>
    );
}
