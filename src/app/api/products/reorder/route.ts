
import { reorderProducts } from '@/db/queries';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { items } = await request.json(); // items: { id, sortOrder }[]

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
        }

        await reorderProducts(items);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Reorder error:', error);
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
    }
}
