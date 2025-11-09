import { z } from "zod";
import { pgTable, serial, varchar, text, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// ============================================
// DRIZZLE ORM DATABASE TABLES
// ============================================

// Tiles table
// Note: updatedAt is managed in application layer (storage.ts) - set manually on updates
export const tiles = pgTable("tiles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // Stable string identifier (e.g., "research", "photos")
  userId: varchar("user_id", { length: 255 }), // Nullable for single-user mode, enforced in future multi-user
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").default("").notNull(),
  color: varchar("color", { length: 7 }).default("#4f46e5").notNull(),
  icon: varchar("icon", { length: 50 }).default("folder-open").notNull(),
  progress: integer("progress").default(0),
  order: integer("order").default(0).notNull(),
  template: varchar("template", { length: 50 }), // 'kanban', 'checklist', 'table', null for default
  templateData: json("template_data"), // template-specific data structure
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Updated manually in storage layer
}, (table) => ({
  slugIdx: {
    columns: [table.slug],
    unique: true,
  },
  userIdIdx: {
    columns: [table.userId],
  },
}));

export type Tile = typeof tiles.$inferSelect;
export type InsertTile = typeof tiles.$inferInsert;
export const insertTileSchema = createInsertSchema(tiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectTileSchema = createSelectSchema(tiles);

// Compatibility type for legacy localStorage data
export type LegacyTile = {
  id: string; // legacy string ID (maps to slug)
  title: string;
  content: string;
  lastUpdated: string;
  color: string;
  icon: string;
  progress?: number;
  order: number;
  template?: string;
  templateData?: any;
};

// Photos table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  tileId: integer("tile_id").references(() => tiles.id, { onDelete: "cascade" }).notNull(),
  base64Data: text("base64_data").notNull(),
  thumbnail: text("thumbnail").notNull(),
  caption: varchar("caption", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tileIdIdx: {
    columns: [table.tileId],
  },
}));

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true, createdAt: true });

// Settings table
// Single-user mode: userId is null. Multi-user: userId required and unique
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }), // Nullable for single-user mode (localStorage migration)
  darkMode: boolean("dark_mode").default(false).notNull(),
  tileOrder: json("tile_order").$type<string[]>().default([]).notNull(), // Array of tile slugs
  lastBackup: timestamp("last_backup"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Updated manually in storage layer
}, (table) => ({
  userIdIdx: {
    columns: [table.userId],
    unique: true, // One settings row per user (null allowed for single-user)
  },
}));

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

// Tile Versions table (for version history feature)
// Stores complete snapshots of tile state for restore capability
export const tileVersions = pgTable("tile_versions", {
  id: serial("id").primaryKey(),
  tileId: integer("tile_id").references(() => tiles.id, { onDelete: "cascade" }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(), // Copy of tile slug for reference
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  progress: integer("progress").default(0),
  order: integer("order").default(0).notNull(),
  template: varchar("template", { length: 50 }),
  templateData: json("template_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tileIdIdx: {
    columns: [table.tileId],
  },
  createdAtIdx: {
    columns: [table.createdAt],
  },
}));

export type TileVersion = typeof tileVersions.$inferSelect;
export type InsertTileVersion = typeof tileVersions.$inferInsert;

// Shared Links table (for collaborative sharing feature)
export const sharedLinks = pgTable("shared_links", {
  id: serial("id").primaryKey(),
  tileId: integer("tile_id").references(() => tiles.id, { onDelete: "cascade" }).notNull(),
  shareToken: varchar("share_token", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  tileIdIdx: {
    columns: [table.tileId],
  },
  shareTokenIdx: {
    columns: [table.shareToken],
    unique: true,
  },
}));

export type SharedLink = typeof sharedLinks.$inferSelect;
export type InsertSharedLink = typeof sharedLinks.$inferInsert;

// Reminders table (for notifications feature)
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  tileId: integer("tile_id").references(() => tiles.id, { onDelete: "cascade" }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  recurring: varchar("recurring", { length: 50 }), // 'daily', 'weekly', 'monthly', null
  notified: boolean("notified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tileIdIdx: {
    columns: [table.tileId],
  },
  dueDateIdx: {
    columns: [table.dueDate],
  },
}));

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

// Analytics Events table (for usage tracking)
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  tileId: integer("tile_id").references(() => tiles.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'open', 'edit', 'close'
  duration: integer("duration"), // time spent in seconds (for 'close' events)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tileIdIdx: {
    columns: [table.tileId],
  },
  eventTypeIdx: {
    columns: [table.eventType],
  },
  createdAtIdx: {
    columns: [table.createdAt],
  },
}));

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// ============================================
// DRIZZLE ORM RELATIONS
// ============================================

export const tilesRelations = relations(tiles, ({ many }) => ({
  photos: many(photos),
  versions: many(tileVersions),
  sharedLinks: many(sharedLinks),
  reminders: many(reminders),
  analyticsEvents: many(analyticsEvents),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  tile: one(tiles, {
    fields: [photos.tileId],
    references: [tiles.id],
  }),
}));

export const tileVersionsRelations = relations(tileVersions, ({ one }) => ({
  tile: one(tiles, {
    fields: [tileVersions.tileId],
    references: [tiles.id],
  }),
}));

export const sharedLinksRelations = relations(sharedLinks, ({ one }) => ({
  tile: one(tiles, {
    fields: [sharedLinks.tileId],
    references: [tiles.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  tile: one(tiles, {
    fields: [reminders.tileId],
    references: [tiles.id],
  }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  tile: one(tiles, {
    fields: [analyticsEvents.tileId],
    references: [tiles.id],
  }),
}));

// ============================================
// DEFAULT SEED DATA
// ============================================

// Default tile slugs in order
export const DEFAULT_TILE_SLUGS = ["research", "charters", "vessels", "equipment", "operations", "methodology", "storyboard", "personal", "photos"];

// Default tiles seed data (for database initialization)
export const DEFAULT_TILES_SEED: InsertTile[] = [
  {
    slug: "research",
    title: "Research",
    content: "",
    color: "#4f46e5", // indigo
    icon: "flask-conical",
    order: 0,
  },
  {
    slug: "charters",
    title: "Charters",
    content: "",
    color: "#0891b2", // cyan
    icon: "file-text",
    order: 1,
  },
  {
    slug: "vessels",
    title: "Vessels",
    content: "",
    color: "#0284c7", // blue
    icon: "ship",
    order: 2,
  },
  {
    slug: "equipment",
    title: "Equipment",
    content: "",
    color: "#7c3aed", // violet
    icon: "settings",
    order: 3,
  },
  {
    slug: "operations",
    title: "Operations",
    content: "",
    color: "#ea580c", // orange
    icon: "wrench",
    order: 4,
  },
  {
    slug: "methodology",
    title: "Methodology",
    content: "",
    color: "#16a34a", // green
    icon: "bar-chart",
    order: 5,
  },
  {
    slug: "storyboard",
    title: "Storyboard",
    content: "",
    color: "#dc2626", // red
    icon: "film",
    order: 6,
  },
  {
    slug: "personal",
    title: "Personal",
    content: "",
    color: "#db2777", // pink
    icon: "user",
    order: 7,
  },
  {
    slug: "photos",
    title: "Photos",
    content: "",
    color: "#65a30d", // lime
    icon: "camera",
    order: 8,
  },
];

// Default settings seed data
export const DEFAULT_SETTINGS_SEED: InsertSettings = {
  darkMode: false,
  tileOrder: DEFAULT_TILE_SLUGS,
};
