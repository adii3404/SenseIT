import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __senseitPostgresqlPool?: Pool;
  __senseitDrizzleDb?: ReturnType<typeof drizzle>;
};

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  if (!globalForDb.__senseitDrizzleDb) {
    globalForDb.__senseitPostgresqlPool =
      globalForDb.__senseitPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      });

    globalForDb.__senseitDrizzleDb = drizzle(globalForDb.__senseitPostgresqlPool);
  }

  return globalForDb.__senseitDrizzleDb;
}

// Proxy export: allows existing `db.select()...` syntax at runtime without crashing static page data collection during build
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop, receiver) {
    const activeDb = getDb();
    if (!activeDb) {
      // During build time or standalone serverless without DB, return mock chainable queries
      return (...args: unknown[]) => {
        return {
          from: () => ({
            orderBy: () => ({
              limit: () => Promise.resolve([]),
              then: (resolve: (v: unknown[]) => void) => Promise.resolve(resolve([])),
            }),
            limit: () => Promise.resolve([]),
            then: (resolve: (v: unknown[]) => void) => Promise.resolve(resolve([])),
          }),
          values: () => ({
            returning: () => Promise.resolve([{ id: 1, createdAt: new Date() }]),
            then: (resolve: (v: unknown[]) => void) => Promise.resolve(resolve([])),
          }),
          execute: () => Promise.resolve({ rows: [] }),
          then: (resolve: (v: unknown[]) => void) => Promise.resolve(resolve([])),
        };
      };
    }
    const val = Reflect.get(activeDb, prop, receiver);
    return typeof val === "function" ? val.bind(activeDb) : val;
  },
});

