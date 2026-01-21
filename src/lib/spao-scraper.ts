
import * as cheerio from 'cheerio';

export interface SpaoProduct {
  name: string;
  price: string;
  originalPrice?: string;
  discountRate?: number;
  imageUrl: string;
  url: string;
}

// Helper to clean price string
function cleanPrice(raw: string): string {
  const nums = raw.replace(/[^0-9]/g, '');
  return nums ? parseInt(nums).toLocaleString() + '원' : '가격 미정';
}

export async function scrapeSpaoProduct(input: string): Promise<SpaoProduct[]> {
  try {
    const isUrl = input.includes('spao.com');

    // Case 1: Direct URL Scraping (Single Product)
    if (isUrl) {
      const response = await fetch(input, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      const productName = $('.name').first().text().trim() ||
        $('.detail_title').first().text().trim() ||
        $('meta[property="og:title"]').attr('content')?.split(' : ')[0];

      const priceRaw = $('.price').first().text().trim() ||
        $('.price_num').first().text().trim() ||
        $('.custom_price').first().text().trim();

      const originalPriceRaw = $('.custom.through').first().text().trim() ||
        $('.detail_price').first().text().trim() || '';

      const saleText = $('.sale_text').first().text().trim(); // e.g. "22%"
      let discountRate: number | undefined = undefined;
      if (saleText.includes('%')) {
        discountRate = parseInt(saleText.replace(/[^0-9]/g, ''));
      }

      let imageUrl = $('.keyImg img').attr('src') ||
        $('.key_img img').attr('src') ||
        $('meta[property="og:image"]').attr('content') || '';

      if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

      if (!productName) return [];

      return [{
        name: productName,
        price: cleanPrice(priceRaw),
        originalPrice: originalPriceRaw ? cleanPrice(originalPriceRaw) : undefined,
        discountRate,
        imageUrl,
        url: input
      }];
    }

    // Case 2: Keyword Search (Multiple Products)
    else {
      const searchUrl = `https://m.spao.com/product/search.html?keyword=${encodeURIComponent(input)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      const results: SpaoProduct[] = [];

      $('ul.prdList.grid2 li').each((_, el) => {
        const item = $(el);
        const name = item.find('.name').text().trim();
        const price = item.find('.price').text().trim() || item.find('[class*="price"]').last().text().trim();

        const originalPriceRaw = item.find('.custom.through').text().trim() || item.find('li[rel="소비자가"] span').text().trim();
        const saleText = item.find('.sale_text').text().trim();
        let discountRate: number | undefined = undefined;
        if (saleText.includes('%')) {
          discountRate = parseInt(saleText.replace(/[^0-9]/g, ''));
        }

        // Handle Lazy Loading: Check ec-data-src first, then data-src, then src
        const imgEl = item.find('img');
        let image = imgEl.attr('ec-data-src') || imgEl.attr('data-src') || imgEl.attr('src') || '';
        let link = item.find('a').attr('href') || '';

        if (image && image.startsWith('//')) image = 'https:' + image;
        if (link && !link.startsWith('http')) link = 'https://m.spao.com' + link;

        if (name && link) {
          results.push({
            name,
            price: cleanPrice(price),
            originalPrice: originalPriceRaw ? cleanPrice(originalPriceRaw) : undefined,
            discountRate,
            imageUrl: image,
            url: link
          });
        }
      });

      return results.slice(0, 10); // Return top 10 matches
    }

  } catch (error) {
    console.error('Error scrapping SPAO:', error);
    return [];
  }
}
