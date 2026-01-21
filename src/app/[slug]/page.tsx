
import { ExternalLink } from 'lucide-react';
import { getProductsBySupporterSlug, getSupporterBySlug } from '@/db/queries';
import { notFound } from 'next/navigation';
import ProductLink from '@/components/ProductLink';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supporter = await getSupporterBySlug(slug);

    if (!supporter) {
        return {
            title: 'SPAO Creator',
            description: '스파오 크리에이터 페이지입니다.'
        };
    }

    return {
        title: `스파오 크리에이터 ${supporter.name}님이 말아주는 아이템`,
        description: supporter.description || '스파오의 힙한 아이템을 소개합니다 ✨',
        openGraph: {
            title: `스파오 크리에이터 ${supporter.name}님이 말아주는 아이템`,
            description: supporter.description || '스파오의 힙한 아이템을 소개합니다 ✨',
            images: [
                {
                    url: supporter.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${supporter.name}`,
                    width: 800,
                    height: 800,
                    alt: `${supporter.name}님의 프로필`,
                },
            ],
        },
    };
}

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
                    {products.map((product, idx) => {
                        // Helper to calculate discount if missing
                        let displayDiscount = product.discountRate;
                        if (!displayDiscount && product.originalPrice && product.price) {
                            try {
                                const original = parseInt(product.originalPrice.replace(/[^0-9]/g, ''));
                                const current = parseInt(product.price.replace(/[^0-9]/g, ''));
                                if (original > current && original > 0) {
                                    displayDiscount = Math.round(((original - current) / original) * 100);
                                }
                            } catch (e) {
                                // Ignore calculation errors
                            }
                        }

                        return (
                            <ProductLink key={idx} product={product} displayDiscount={displayDiscount || undefined} />
                        );
                    })}

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
