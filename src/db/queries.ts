
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

export async function getSupporterBySlug(slug: string) {
  const result = await db.select().from(supporters).where(eq(supporters.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getProductsBySupporterId(supporterId: number) {
  return await db.select().from(products).where(eq(products.supporterId, supporterId));
}

export async function getProductsBySupporterSlug(supporterSlug: string) {
    const supporter = await getSupporterBySlug(supporterSlug);
    if (!supporter) return [];
    return await getProductsBySupporterId(supporter.id);
}
