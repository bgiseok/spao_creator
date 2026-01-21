import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

// Fallback for build time if env is missing (Vercel build phase)
const connectionString = process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy-host.neon.tech/dummy";

if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is missing. Using dummy connection for build.");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
