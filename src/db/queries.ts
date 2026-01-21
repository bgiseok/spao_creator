
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";
import { products, supporters } from './schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function addProduct(
  supporterId: number,
  name: string,
  price: string,
  imageUrl: string,
  linkUrl: string,
  originalPrice?: string,
  discountRate?: number
) {
  return await db.insert(products).values({
    supporterId,
    name,
    price,
    imageUrl,
    linkUrl,
    originalPrice,
    discountRate
  }).returning();
}

export async function getSupporterBySlug(slug: string) {
  const result = await db.select().from(supporters).where(eq(supporters.slug, slug)).limit(1);
  return result[0] || null;
}

export async function createSupporter(slug: string, name: string) {
  return await db.insert(supporters).values({
    slug,
    name
  }).returning();
}

export async function updateSupporter(id: number, data: { description?: string; profileImage?: string }) {
  return await db.update(supporters)
    .set({
      ...(data.description !== undefined && { description: data.description }),
      ...(data.profileImage !== undefined && { profileImage: data.profileImage }),
    })
    .where(eq(supporters.id, id))
    .returning();
}

export async function getProductsBySupporterId(supporterId: number) {
  return await db.select().from(products).where(eq(products.supporterId, supporterId)).orderBy(products.createdAt);
}

export async function deleteProduct(id: number) {
  return await db.delete(products).where(eq(products.id, id)).returning();
}

export async function getProductsBySupporterSlug(supporterSlug: string) {
  const supporter = await getSupporterBySlug(supporterSlug);
  if (!supporter) return [];
  return await getProductsBySupporterId(supporter.id);
}
