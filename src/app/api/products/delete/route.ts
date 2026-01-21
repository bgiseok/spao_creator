
import { NextResponse } from 'next/server';
import { deleteProduct } from '@/db/queries';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const deleted = await deleteProduct(id);

        if (!deleted || deleted.length === 0) {
            return NextResponse.json({ error: 'Product not found or failed to delete' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deleted: deleted[0] });

    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
