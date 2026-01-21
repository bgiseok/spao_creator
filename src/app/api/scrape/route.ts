
import { NextResponse } from 'next/server';
import { scrapeSpaoProduct } from '@/lib/spao-scraper';

import { logSearchKeyword } from '@/db/queries';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Log search if it's not a URL
        if (!url.includes('spao.com') && !url.includes('http')) {
            // Non-blocking log
            logSearchKeyword(url.trim()).catch(e => console.error("Search logging failed", e));
        }

        const products = await scrapeSpaoProduct(url); // 'url' param carries either URL or Keyword

        if (!products || products.length === 0) {
            // Return 200 with empty list instead of 404 to handle "no results found" gracefully
            return NextResponse.json({ products: [] });
        }

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Scrape API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
