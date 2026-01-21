
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is missing. Please add it to your .env.local file.");
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
