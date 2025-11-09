import { db } from "./db";
import { 
  tiles, 
  photos, 
  settings, 
  tileVersions,
  sharedLinks,
  reminders,
  analyticsEvents,
  type Tile,
  type InsertTile,
  type Photo,
  type InsertPhoto,
  type Settings,
  type InsertSettings,
  type TileVersion,
  type InsertTileVersion,
  type SharedLink,
  type InsertSharedLink,
  type Reminder,
  type InsertReminder,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  DEFAULT_TILES_SEED,
  DEFAULT_SETTINGS_SEED,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Tiles
  getTiles(userId?: string): Promise<Tile[]>;
  getTile(id: number): Promise<Tile | undefined>;
  getTileBySlug(slug: string, userId?: string): Promise<Tile | undefined>;
  createTile(tile: InsertTile): Promise<Tile>;
  updateTile(id: number, tile: Partial<InsertTile>): Promise<Tile | undefined>;
  deleteTile(id: number): Promise<boolean>;
  
  // Photos
  getAllPhotos(): Promise<Photo[]>;
  getPhotos(tileId: number): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
  
  // Settings
  getSettings(userId?: string): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(id: number, settings: Partial<InsertSettings>): Promise<Settings | undefined>;
  
  // Tile Versions (for version history)
  getTileVersions(tileId: number): Promise<TileVersion[]>;
  createTileVersion(version: InsertTileVersion): Promise<TileVersion>;
  
  // Shared Links (for collaboration)
  getSharedLink(shareToken: string): Promise<SharedLink | undefined>;
  getSharedLinksForTile(tileId: number): Promise<SharedLink[]>;
  createSharedLink(link: InsertSharedLink): Promise<SharedLink>;
  updateSharedLink(id: number, link: Partial<InsertSharedLink>): Promise<SharedLink | undefined>;
  deleteSharedLink(id: number): Promise<boolean>;
  
  // Reminders
  getReminders(tileId: number): Promise<Reminder[]>;
  getActiveReminders(): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Analytics Events
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(tileId?: number, limit?: number): Promise<AnalyticsEvent[]>;
  
  // Database initialization
  initializeDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ============================================
  // TILES
  // ============================================
  
  async getTiles(userId?: string): Promise<Tile[]> {
    if (userId) {
      return await db.select().from(tiles).where(eq(tiles.userId, userId)).orderBy(tiles.order);
    }
    // Single-user mode: get all tiles where userId is null
    return await db.select().from(tiles).where(sql`${tiles.userId} IS NULL`).orderBy(tiles.order);
  }
  
  async getTile(id: number): Promise<Tile | undefined> {
    const result = await db.select().from(tiles).where(eq(tiles.id, id)).limit(1);
    return result[0];
  }
  
  async getTileBySlug(slug: string, userId?: string): Promise<Tile | undefined> {
    if (userId) {
      const result = await db.select().from(tiles)
        .where(and(eq(tiles.slug, slug), eq(tiles.userId, userId)))
        .limit(1);
      return result[0];
    }
    // Single-user mode
    const result = await db.select().from(tiles)
      .where(and(eq(tiles.slug, slug), sql`${tiles.userId} IS NULL`))
      .limit(1);
    return result[0];
  }
  
  async createTile(insertTile: InsertTile): Promise<Tile> {
    const result = await db.insert(tiles).values(insertTile).returning();
    return result[0];
  }
  
  async updateTile(id: number, updateData: Partial<InsertTile>): Promise<Tile | undefined> {
    // Manually set updatedAt as documented in schema
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    const result = await db.update(tiles)
      .set(dataWithTimestamp)
      .where(eq(tiles.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteTile(id: number): Promise<boolean> {
    const result = await db.delete(tiles).where(eq(tiles.id, id)).returning();
    return result.length > 0;
  }
  
  // ============================================
  // PHOTOS
  // ============================================
  
  async getAllPhotos(): Promise<Photo[]> {
    return await db.select().from(photos).orderBy(desc(photos.createdAt));
  }
  
  async getPhotos(tileId: number): Promise<Photo[]> {
    return await db.select().from(photos)
      .where(eq(photos.tileId, tileId))
      .orderBy(desc(photos.createdAt));
  }
  
  async getPhoto(id: number): Promise<Photo | undefined> {
    const result = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
    return result[0];
  }
  
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const result = await db.insert(photos).values(insertPhoto).returning();
    return result[0];
  }
  
  async deletePhoto(id: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id)).returning();
    return result.length > 0;
  }
  
  // ============================================
  // SETTINGS
  // ============================================
  
  async getSettings(userId?: string): Promise<Settings | undefined> {
    if (userId) {
      const result = await db.select().from(settings)
        .where(eq(settings.userId, userId))
        .limit(1);
      return result[0];
    }
    // Single-user mode: get settings where userId is null
    const result = await db.select().from(settings)
      .where(sql`${settings.userId} IS NULL`)
      .limit(1);
    return result[0];
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const result = await db.insert(settings).values(insertSettings).returning();
    return result[0];
  }
  
  async updateSettings(id: number, updateData: Partial<InsertSettings>): Promise<Settings | undefined> {
    // Manually set updatedAt as documented in schema
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    const result = await db.update(settings)
      .set(dataWithTimestamp)
      .where(eq(settings.id, id))
      .returning();
    
    return result[0];
  }
  
  // ============================================
  // TILE VERSIONS (Version History)
  // ============================================
  
  async getTileVersions(tileId: number): Promise<TileVersion[]> {
    return await db.select().from(tileVersions)
      .where(eq(tileVersions.tileId, tileId))
      .orderBy(desc(tileVersions.createdAt));
  }
  
  async createTileVersion(insertVersion: InsertTileVersion): Promise<TileVersion> {
    const result = await db.insert(tileVersions).values(insertVersion).returning();
    return result[0];
  }
  
  // ============================================
  // SHARED LINKS (Collaboration)
  // ============================================
  
  async getSharedLink(shareToken: string): Promise<SharedLink | undefined> {
    const result = await db.select().from(sharedLinks)
      .where(eq(sharedLinks.shareToken, shareToken))
      .limit(1);
    return result[0];
  }
  
  async getSharedLinksForTile(tileId: number): Promise<SharedLink[]> {
    return await db.select().from(sharedLinks)
      .where(eq(sharedLinks.tileId, tileId))
      .orderBy(desc(sharedLinks.createdAt));
  }
  
  async createSharedLink(insertLink: InsertSharedLink): Promise<SharedLink> {
    const result = await db.insert(sharedLinks).values(insertLink).returning();
    return result[0];
  }
  
  async updateSharedLink(id: number, updateData: Partial<InsertSharedLink>): Promise<SharedLink | undefined> {
    const result = await db.update(sharedLinks)
      .set(updateData)
      .where(eq(sharedLinks.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteSharedLink(id: number): Promise<boolean> {
    const result = await db.delete(sharedLinks).where(eq(sharedLinks.id, id)).returning();
    return result.length > 0;
  }
  
  // ============================================
  // REMINDERS
  // ============================================
  
  async getReminders(tileId: number): Promise<Reminder[]> {
    return await db.select().from(reminders)
      .where(eq(reminders.tileId, tileId))
      .orderBy(reminders.dueDate);
  }
  
  async getActiveReminders(): Promise<Reminder[]> {
    const now = new Date();
    return await db.select().from(reminders)
      .where(and(
        sql`${reminders.dueDate} <= ${now}`,
        eq(reminders.notified, false)
      ))
      .orderBy(reminders.dueDate);
  }
  
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const result = await db.insert(reminders).values(insertReminder).returning();
    return result[0];
  }
  
  async updateReminder(id: number, updateData: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const result = await db.update(reminders)
      .set(updateData)
      .where(eq(reminders.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    const result = await db.delete(reminders).where(eq(reminders.id, id)).returning();
    return result.length > 0;
  }
  
  // ============================================
  // ANALYTICS EVENTS
  // ============================================
  
  async createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const result = await db.insert(analyticsEvents).values(insertEvent).returning();
    return result[0];
  }
  
  async getAnalyticsEvents(tileId?: number, limit: number = 100): Promise<AnalyticsEvent[]> {
    if (tileId) {
      return await db.select().from(analyticsEvents)
        .where(eq(analyticsEvents.tileId, tileId))
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(limit);
    }
    
    return await db.select().from(analyticsEvents)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);
  }
  
  // ============================================
  // DATABASE INITIALIZATION
  // ============================================
  
  async initializeDatabase(): Promise<void> {
    // Check if we already have tiles
    const existingTiles = await db.select().from(tiles).limit(1);
    
    if (existingTiles.length === 0) {
      // Seed default tiles
      await db.insert(tiles).values(DEFAULT_TILES_SEED);
      
      // Seed default settings
      await db.insert(settings).values(DEFAULT_SETTINGS_SEED);
      
      console.log("Database initialized with default tiles and settings");
    }
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
