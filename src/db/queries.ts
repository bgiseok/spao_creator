
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";
import { products, supporters } from './schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function addProduct(supporterId: number, name: string, price: string, imageUrl: string, linkUrl: string) {
    return await db.insert(products).values({
        supporterId,
        name,
        price,
        imageUrl,
        linkUrl
    }).returning();
}

export async function getProducts(supporterSlug: string) {
    // Join logic to get products by supporter slug
    // For now simple query mock flow
    const supporter = await db.select().from(supporters).where(eq(supporters.slug, supporterSlug)).limit(1);
    if (!supporter || supporter.length === 0) return [];

    return await db.select().from(products).where(eq(products.supporterId, supporter[0].id));
}
