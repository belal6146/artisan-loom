import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import postgres from "postgres";
import { getEnv } from "../env";
import * as schema from "./schema";

const env = getEnv();

let db: any;

export function getDatabase() {
  if (db) return db;

  if (env.DATABASE_PROVIDER === "sqlite") {
    // SQLite for development
    const dbPath = env.DATABASE_URL.replace("file:", "");
    const sqlite = new Database(dbPath);
    
    // Enable foreign keys and WAL mode for better performance
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("journal_mode = WAL");
    
    db = drizzleSqlite(sqlite, { schema });
  } else {
    // PostgreSQL for production
    const client = postgres(env.DATABASE_URL, {
      ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    db = drizzle(client, { schema });
  }

  return db;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const database = getDatabase();
    
    if (env.DATABASE_PROVIDER === "sqlite") {
      // Simple query for SQLite
      await database.run("SELECT 1");
    } else {
      // Simple query for PostgreSQL
      await database.execute("SELECT 1");
    }
    
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

export { schema };