
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";
import { products, supporters, searchLogs, catalogs } from './schema';
import { eq, desc, sql, and } from 'drizzle-orm';

const dbSql = neon(process.env.DATABASE_URL!);
const db = drizzle(dbSql, { schema });

// --- Products ---

// Helper to get next sort order
async function getNextSortOrder(supporterId: number, catalogId?: number) {
  // If catalogId is provided, get max match.
  // Else, get max for supporter (legacy fallback)
  const whereClause = catalogId
    ? and(eq(products.supporterId, supporterId), eq(products.catalogId, catalogId))
    : eq(products.supporterId, supporterId);

  const result = await db.select({ maxOrder: sql<number>`max(${products.sortOrder})` })
    .from(products)
    .where(whereClause);

  return (result[0]?.maxOrder || 0) + 1;
}

export async function addProduct(
  supporterId: number,
  name: string,
  price: string,
  imageUrl: string,
  linkUrl: string,
  originalPrice?: string,
  discountRate?: number,
  catalogId?: number
) {
  const nextOrder = await getNextSortOrder(supporterId, catalogId);

  return await db.insert(products).values({
    supporterId,
    name,
    price,
    imageUrl,
    linkUrl,
    originalPrice,
    discountRate,
    catalogId,
    sortOrder: nextOrder
  }).returning();
}

export async function getProductsBySupporterId(supporterId: number, catalogId?: number) {
  if (catalogId) {
    return await db.select().from(products)
      .where(
        and(
          eq(products.supporterId, supporterId),
          eq(products.catalogId, catalogId)
        )
      )
      .orderBy(products.sortOrder, desc(products.createdAt));
  }
  return await db.select().from(products)
    .where(eq(products.supporterId, supporterId))
    .orderBy(products.sortOrder, desc(products.createdAt));
}

export async function deleteProduct(id: number) {
  return await db.delete(products).where(eq(products.id, id)).returning();
}

export async function updateProductCatalog(productId: number, catalogId: number) {
  // When moving, append to end of new catalog
  // We need to fetch the new catalog's max order first? 
  // Or just let user reorder later. For simplicity, we just move it.
  // Ideally we append to end.
  // Let's quickly fetch product to get supporterId, then get max order.
  // For MVP, just update catalogId. User can reorder if they want.
  // Actually, let's reset sortOrder to 0 or something distinctive? No, strictly append is better.
  // Only update catalogId for now to keep it snappy.
  return await db.update(products)
    .set({ catalogId })
    .where(eq(products.id, productId))
    .returning();
}

export async function reorderProducts(items: { id: number, sortOrder: number }[]) {
  // Batch update? Drizzle doesn't have bulk update with different values easily.
  // We loop. Promise.all.
  // Ideally use a CASE statement in SQL, but loop is acceptable for small lists (top 50).
  const promises = items.map(item =>
    db.update(products)
      .set({ sortOrder: item.sortOrder })
      .where(eq(products.id, item.id))
  );
  return await Promise.all(promises);
}

// Get products for the PUBLIC page (respects active catalog)
export async function getProductsBySupporterSlug(supporterSlug: string) {
  const supporter = await getSupporterBySlug(supporterSlug);
  if (!supporter) return [];

  // Find active catalog logic
  // If there are active catalogs, pick the latest one.
  const activeCatalog = await db.select().from(catalogs)
    .where(and(eq(catalogs.supporterId, supporter.id), eq(catalogs.isActive, true)))
    .orderBy(desc(catalogs.createdAt))
    .limit(1);

  if (activeCatalog.length > 0) {
    return await getProductsBySupporterId(supporter.id, activeCatalog[0].id);
  } else {
    // Fallback: If no catalog is active, maybe show all? Or Show "Default" catalog which is null?
    // Old behavior: Show all. Let's stick to that for backward compatibility or strict "uncategorized".
    // For now, let's show ALL products if no active catalog is selected to avoid empty pages.
    return await getProductsBySupporterId(supporter.id);
  }
}

// --- Supporters ---

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

// --- Catalogs ---

export async function createCatalog(supporterId: number, title: string) {
  return await db.insert(catalogs).values({ supporterId, title }).returning();
}

export async function getCatalogs(supporterId: number) {
  return await db.select().from(catalogs).where(eq(catalogs.supporterId, supporterId)).orderBy(desc(catalogs.createdAt));
}

export async function setActiveCatalog(supporterId: number, catalogId: number) {
  // 1. Deactivate all for this supporter
  await db.update(catalogs)
    .set({ isActive: false })
    .where(eq(catalogs.supporterId, supporterId));

  // 2. Activate the target
  return await db.update(catalogs)
    .set({ isActive: true })
    .where(and(eq(catalogs.id, catalogId), eq(catalogs.supporterId, supporterId)))
    .returning();
}

// --- Insights & Logs ---

// Log Search Keyword (Upsert-like logic)
export async function logSearchKeyword(keyword: string) {
  // Basic upsert: check exist, update or insert
  const existing = await db.select().from(searchLogs).where(eq(searchLogs.keyword, keyword)).limit(1);
  if (existing.length > 0) {
    return await db.update(searchLogs)
      .set({
        count: existing[0].count! + 1,
        lastSearchedAt: new Date()
      })
      .where(eq(searchLogs.keyword, keyword))
      .returning();
  } else {
    return await db.insert(searchLogs).values({ keyword }).returning();
  }
}

export async function getTopKeywords() {
  return await db.select().from(searchLogs).orderBy(desc(searchLogs.count)).limit(10);
}

// Increment Product Click
export async function incrementProductClick(productId: number) {
  // We assume product exists. direct update.
  // Not purely atomic without sql increments but acceptable for low traffic POC.
  // Better: set({ clickCount: sql`${products.clickCount} + 1` })
  return await db.update(products)
    .set({ clickCount: sql`${products.clickCount} + 1` })
    .where(eq(products.id, productId))
    .returning();
}

export async function getMostClickedProducts(limit = 10) {
  return await db.select().from(products).where(sql`${products.clickCount} > 0`).orderBy(desc(products.clickCount)).limit(limit);
}

export async function getMostSavedProducts(limit = 10) {
  // Group by product name -> count.
  // Drizzle group by is basic.
  // select name, count(*) as count from products group by name order by count desc limit 10
  return await db.select({
    name: products.name,
    imageUrl: products.imageUrl, // Any image
    count: sql<number>`cast(count(${products.id}) as int)`
  })
    .from(products)
    .groupBy(products.name, products.imageUrl)
    .orderBy(desc(sql`count(${products.id})`))
    .limit(limit);
}
