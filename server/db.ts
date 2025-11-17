import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Export a flag indicating whether a real database is configured.
export const hasDatabase = Boolean(process.env.DATABASE_URL);

let pool: any = undefined;
let db: any = undefined;

if (hasDatabase) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  if (process.env.NODE_ENV === 'development') {
    console.warn("No DATABASE_URL set — running in development mode with in-memory fallback.");
  } else {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
}

export { pool, db };
