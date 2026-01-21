
import { NextResponse } from 'next/server';
import { scrapeSpaoProduct } from '@/lib/spao-scraper';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const product = await scrapeSpaoProduct(url);

        if (!product) {
            return NextResponse.json({ error: 'Failed to scrape product' }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Scrape API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
