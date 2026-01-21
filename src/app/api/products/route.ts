
import { NextResponse } from 'next/server';
import { addProduct } from '@/db/queries';

export async function POST(request: Request) {
    try {
        const { supporterId, name, price, imageUrl, linkUrl } = await request.json();

        if (!supporterId || !name || !price || !imageUrl || !linkUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newProduct = await addProduct(
            Number(supporterId),
            name,
            price,
            imageUrl,
            linkUrl
        );

        return NextResponse.json({ product: newProduct[0] });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
