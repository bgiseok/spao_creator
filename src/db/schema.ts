
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const supporters = pgTable("supporters", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    profileImage: text("profile_image"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    supporterId: integer("supporter_id").references(() => supporters.id).notNull(),
    name: text("name").notNull(),
    price: text("price").notNull(),
    imageUrl: text("image_url").notNull(),
    linkUrl: text("link_url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
