
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

import { boolean } from "drizzle-orm/pg-core";

export const supporters = pgTable("supporters", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    profileImage: text("profile_image"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const catalogs = pgTable("catalogs", {
    id: serial("id").primaryKey(),
    supporterId: integer("supporter_id").references(() => supporters.id).notNull(),
    title: text("title").notNull(),
    isActive: boolean("is_active").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    supporterId: integer("supporter_id").references(() => supporters.id).notNull(),
    catalogId: integer("catalog_id").references(() => catalogs.id),
    name: text("name").notNull(),
    price: text("price").notNull(),
    originalPrice: text("original_price"),
    discountRate: integer("discount_rate"),
    clickCount: integer("click_count").default(0),
    imageUrl: text("image_url").notNull(),
    linkUrl: text("link_url").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
});

export const searchLogs = pgTable("search_logs", {
    keyword: text("keyword").primaryKey(),
    count: integer("count").default(1),
    lastSearchedAt: timestamp("last_searched_at").defaultNow(),
});
