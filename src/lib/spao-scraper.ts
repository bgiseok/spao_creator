
import * as cheerio from 'cheerio';

export interface SpaoProduct {
  name: string;
  price: string;
  imageUrl: string;
  url: string;
}

export async function scrapeSpaoProduct(url: string): Promise<SpaoProduct | null> {
  try {
    // Basic validation
    if (!url.includes('spao.com')) return null;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strategy 1: Open Graph Tags (Best and most reliable for shareable pages)
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogPrice = $('meta[property="product:price:amount"]').attr('content'); // Sometimes available
    
    // Strategy 2: DOM Selectors (Fallback)
    // Based on previous analysis: .name, .price, .keyImg
    const domName = $('.name').first().text().trim() || $('.detail_title').text().trim();
    // Price often has "원" or commas
    const domPriceRaw = $('.price').first().text().trim() || $('.price_num').first().text().trim(); 
    const domPrice = domPriceRaw.replace(/[^0-9]/g, ''); // Extract numbers only

    const domImage = $('.keyImg img').attr('src') || $('.thumbnail img').attr('src');

    const name = ogTitle || domName;
    const price = domPrice || '0'; // Default to 0 if not found
    let imageUrl = ogImage || domImage || '';

    // Fix relative image URLs
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }

    if (!name) return null;

    return {
      name,
      price: parseInt(price).toLocaleString() + '원', // Format with comma
      imageUrl,
      url
    };

  } catch (error) {
    console.error('Error scrapping SPAO product:', error);
    return null;
  }
}
