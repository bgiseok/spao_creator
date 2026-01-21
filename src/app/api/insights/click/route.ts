
import { incrementProductClick } from '@/db/queries';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { productId } = await request.json();
        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        await incrementProductClick(productId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Click tracking error:', error);
        return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }
}
