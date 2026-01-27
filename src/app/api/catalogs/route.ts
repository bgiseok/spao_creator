
import { createCatalog, getCatalogs, deleteCatalog } from '@/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const supporterId = searchParams.get('supporterId');

    if (!supporterId) {
        return NextResponse.json({ error: 'Supporter ID required' }, { status: 400 });
    }

    try {
        const catalogs = await getCatalogs(parseInt(supporterId));
        return NextResponse.json({ catalogs });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch catalogs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supporterId, title } = await request.json();
        if (!supporterId || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newCatalog = await createCatalog(supporterId, title);
        return NextResponse.json({ catalog: newCatalog[0] });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create catalog' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const supporterId = searchParams.get('supporterId');
        const catalogId = searchParams.get('catalogId');

        if (!supporterId || !catalogId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await deleteCatalog(parseInt(supporterId), parseInt(catalogId));
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete catalog' }, { status: 500 });
    }
}
