import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Critical infrastructure assets tracked by the SenseIT forecaster.
 * Real-world coordinates power both the Google Maps integration and
 * the built-in illustrated map fallback.
 */
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // medical | power
  ward: text("ward").notNull(),
  risk: integer("risk").notNull(), // 0 - 100
  severity: text("severity").notNull(), // critical | high | moderate
  impactNote: text("impact_note").notNull(),
  population: integer("population").notNull().default(0),
  lat: doublePrecision("lat").notNull().default(19.3),
  lng: doublePrecision("lng").notNull().default(84.91),
});

/** Immutable log of every alert notification broadcast. */
export const dispatches = pgTable("dispatches", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // warning | notification
  authorities: text("authorities").array().notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Asset = typeof assets.$inferSelect;
export type Dispatch = typeof dispatches.$inferSelect;
