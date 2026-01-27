
import { NextResponse } from 'next/server';
import { addProduct, getProductsBySupporterId } from '@/db/queries';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const supporterId = searchParams.get('supporterId');
        const catalogId = searchParams.get('catalogId');

        if (!supporterId) {
            return NextResponse.json({ error: 'Supporter ID is required' }, { status: 400 });
        }

        const products = await getProductsBySupporterId(
            Number(supporterId),
            catalogId ? Number(catalogId) : undefined
        );

        return NextResponse.json({ products });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supporterId, name, price, imageUrl, linkUrl, originalPrice, discountRate, catalogId } = await request.json();

        if (!supporterId || !name || !price || !imageUrl || !linkUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newProduct = await addProduct(
            Number(supporterId),
            name,
            price,
            imageUrl,
            linkUrl,
            originalPrice,
            discountRate,
            catalogId ? Number(catalogId) : undefined
        );

        return NextResponse.json({ product: newProduct[0] });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
