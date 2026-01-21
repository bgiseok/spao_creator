
import { updateProductCatalog } from '@/db/queries';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { productId, catalogId } = await request.json();

        if (!productId || !catalogId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await updateProductCatalog(productId, catalogId);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Move product error:', error);
        return NextResponse.json({ error: 'Failed to move product' }, { status: 500 });
    }
}
