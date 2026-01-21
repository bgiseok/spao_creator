import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

// Fallback logic for Vercel Build Phase where env might be missing
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not set. Using dummy connection string for build.");
    connectionString = "postgresql://dummy:dummy@dummy-host.neon.tech/dummy";
} else {
    console.log("✅ DATABASE_URL is set.");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
