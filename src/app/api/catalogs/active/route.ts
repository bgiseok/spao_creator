
import { setActiveCatalog } from '@/db/queries';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supporterId, catalogId } = await request.json();
        if (!supporterId || !catalogId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await setActiveCatalog(supporterId, catalogId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to set active catalog' }, { status: 500 });
    }
}
