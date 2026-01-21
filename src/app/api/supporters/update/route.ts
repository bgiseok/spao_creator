
import { NextResponse } from 'next/server';
import { updateSupporter } from '@/db/queries';

export async function POST(request: Request) {
    try {
        const { id, description, profileImage } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Supporter ID is required' }, { status: 400 });
        }

        const updated = await updateSupporter(id, { description, profileImage });

        if (!updated || updated.length === 0) {
            return NextResponse.json({ error: 'Failed to update' }, { status: 404 });
        }

        return NextResponse.json({ supporter: updated[0] });

    } catch (error) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
