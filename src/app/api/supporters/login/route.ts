
import { NextResponse } from 'next/server';
import { getSupporterBySlug, createSupporter, getProductsBySupporterId } from '@/db/queries';

export async function POST(request: Request) {
    try {
        const { slug, name, passcode } = await request.json();

        // Verify Passcode
        const correctPasscode = process.env.ADMIN_PASSCODE || 'spao';
        if (passcode !== correctPasscode) {
            return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
        }

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        let supporter = await getSupporterBySlug(slug);
        let isNew = false;

        if (!supporter) {
            const newSupporter = await createSupporter(slug, name || slug);
            supporter = newSupporter[0];
            isNew = true;
        }

        const products = await getProductsBySupporterId(supporter.id);

        return NextResponse.json({ supporter, products, isNew });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
