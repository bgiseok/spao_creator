
'use client';

import { ReactNode } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductLinkProps {
    product: {
        id: number;
        name: string;
        price: string;
        linkUrl: string;
        imageUrl: string;
        discountRate?: number | null;
    };
    displayDiscount?: number;
}

export default function ProductLink({ product, displayDiscount }: ProductLinkProps) {
    const handleClick = () => {
        // Non-blocking fire-and-forget
        fetch('/api/insights/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id }),
        }).catch(err => console.error("Click track fail", err));
    };

    return (
        <a
            href={product.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="group block"
            onClick={handleClick}
        >
            <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-[3/4] mb-3 relative">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 opacity-20" />
                </div>
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                    {displayDiscount && displayDiscount > 0 ? (
                        <span className="text-red-400 font-extrabold text-sm">{displayDiscount}%</span>
                    ) : null}
                    <span className="font-bold text-sm">{product.price}</span>
                </div>
            </div>
            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors break-all">
                {product.name}
            </h3>
        </a>
    );
}
