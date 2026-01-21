
import { ExternalLink, ShoppingBag } from 'lucide-react';

// Mock data for display purposes until DB is connected
const MOCK_PRODUCTS = [
    {
        name: "(여성) 데님 트러커 재킷_SPJEG23G01",
        price: "59,900원",
        imageUrl: "https://cafe24img.poxo.com/spao/web/product/big/202302/9b3f3b1e7c5b1b5b3b1e7c5b1b5b3b1.jpg",
        // Note: Using a placeholder if real image fails, but in real app this comes from DB
        url: "https://m.spao.com/"
    },
    {
        name: "베이직 푸퍼_SPJPD49C01",
        price: "69,900원",
        imageUrl: "https://cafe24img.poxo.com/spao/web/product/big/202308/8f3f3b1e7c5b1b5b3b1e7c5b1b5b3b2.jpg",
        url: "https://m.spao.com/"
    }
];

export default function LinkTreePage({ params }: { params: { slug: string } }) {
    // close to params.slug
    const supporterName = "스파오 서포터즈";

    return (
        <div className="min-h-screen bg-white">
            {/* Header Profile Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white pb-8 pt-12 px-6 flex flex-col items-center text-center border-b border-gray-100">
                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden ring-4 ring-white shadow-lg">
                    <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${supporterName}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">@{supporterName}</h1>
                <p className="text-gray-500 text-sm font-medium">스파오의 힙한 아이템을 소개합니다 ✨</p>
            </div>

            {/* Product Grid */}
            <div className="max-w-md mx-auto px-4 py-8">
                <div className="grid grid-cols-2 gap-4">
                    {/* We will map real DB data here later */}
                    {MOCK_PRODUCTS.map((product, idx) => (
                        <a
                            key={idx}
                            href={product.url}
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
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    {product.price}
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {product.name}
                            </h3>
                        </a>
                    ))}
                </div>
            </div>

            <footer className="py-8 text-center text-gray-300 text-xs">
                Powered by SPAO Linktree
            </footer>
        </div>
    );
}
