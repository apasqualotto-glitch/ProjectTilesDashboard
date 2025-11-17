import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTileSchema, insertPhotoSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // INITIALIZATION
  // ============================================
  
  app.post("/api/init", async (req, res) => {
    try {
      await storage.initializeDatabase();
      res.json({ success: true, message: "Database initialized" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // TILES
  // ============================================
  
  // Get all tiles (single-user mode)
  app.get("/api/tiles", async (req, res) => {
    try {
      const tiles = await storage.getTiles();
      res.json(tiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // IMPORTANT: Slug route must come before ID route to avoid route conflict
  // Get tile by slug
  app.get("/api/tiles/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const tile = await storage.getTileBySlug(slug);
      
      if (!tile) {
        return res.status(404).json({ error: "Tile not found" });
      }
      
      res.json(tile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get single tile by ID
  app.get("/api/tiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tile ID" });
      }
      
      const tile = await storage.getTile(id);
      
      if (!tile) {
        return res.status(404).json({ error: "Tile not found" });
      }
      
      res.json(tile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create new tile
  app.post("/api/tiles", async (req, res) => {
    try {
      const validatedData = insertTileSchema.parse(req.body);
      const tile = await storage.createTile(validatedData);
      res.status(201).json(tile);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update tile
  app.patch("/api/tiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate update data
      const updateTileSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        color: z.string().length(7).optional(),
        icon: z.string().max(50).optional(),
        progress: z.number().min(0).max(100).optional(),
        order: z.number().optional(),
        template: z.string().max(50).optional(),
        templateData: z.any().optional(),
      });
      
      const validatedData = updateTileSchema.parse(req.body);
      
      // Create version snapshot before updating (for version history)
      const existingTile = await storage.getTile(id);
      if (existingTile) {
        await storage.createTileVersion({
          tileId: existingTile.id,
          slug: existingTile.slug,
          title: existingTile.title,
          content: existingTile.content,
          color: existingTile.color,
          icon: existingTile.icon,
          progress: existingTile.progress || 0,
          order: existingTile.order,
          template: existingTile.template || undefined,
          templateData: existingTile.templateData || undefined,
        });
      }
      
      const tile = await storage.updateTile(id, validatedData);
      
      if (!tile) {
        return res.status(404).json({ error: "Tile not found" });
      }
      
      res.json(tile);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete tile
  app.delete("/api/tiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTile(id);
      
      if (!success) {
        return res.status(404).json({ error: "Tile not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // PHOTOS
  // ============================================
  
  // Get all photos (optionally filtered by tileId)
  app.get("/api/photos", async (req, res) => {
    try {
      const tileId = req.query.tileId ? parseInt(req.query.tileId as string) : undefined;
      
      if (tileId) {
        const photos = await storage.getPhotos(tileId);
        res.json(photos);
      } else {
        // Get all photos in single query
        const photos = await storage.getAllPhotos();
        res.json(photos);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get photos for a tile (convenience route)
  app.get("/api/tiles/:tileId/photos", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      const photos = await storage.getPhotos(tileId);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create photo
  app.post("/api/photos", async (req, res) => {
    try {
      const validatedData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validatedData);
      res.status(201).json(photo);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete photo
  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePhoto(id);
      
      if (!success) {
        return res.status(404).json({ error: "Photo not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // SETTINGS
  // ============================================
  
  // Get settings (single-user mode)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.createSettings({
          darkMode: false,
          tileOrder: [],
        });
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update settings (single-user mode - updates the settings record)
  app.patch("/api/settings", async (req, res) => {
    try {
      // Get existing settings
      const existingSettings = await storage.getSettings();
      
      if (!existingSettings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      // Validate update data
      const updateSchema = z.object({
        darkMode: z.boolean().optional(),
        tileOrder: z.array(z.string()).optional(),
        lastBackup: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      // Convert lastBackup string to Date if provided (storage expects Date|null)
      const dataToUpdate: any = { ...validatedData };
      if (validatedData.lastBackup) {
        dataToUpdate.lastBackup = new Date(validatedData.lastBackup);
      }
      const settings = await storage.updateSettings(existingSettings.id, dataToUpdate);
      
      if (!settings) {
        return res.status(404).json({ error: "Failed to update settings" });
      }
      
      res.json(settings);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // TILE VERSIONS (Version History)
  // ============================================
  
  // Get version history for a tile
  app.get("/api/tiles/:tileId/versions", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      const versions = await storage.getTileVersions(tileId);
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Restore tile to a specific version
  app.post("/api/tiles/:tileId/versions/:versionId/restore", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      const versions = await storage.getTileVersions(tileId);
      const versionToRestore = versions.find(v => v.id === parseInt(req.params.versionId));
      
      if (!versionToRestore) {
        return res.status(404).json({ error: "Version not found" });
      }
      
      // Create a new version snapshot of current state before restoring
      const currentTile = await storage.getTile(tileId);
      if (currentTile) {
        await storage.createTileVersion({
          tileId: currentTile.id,
          slug: currentTile.slug,
          title: currentTile.title,
          content: currentTile.content,
          color: currentTile.color,
          icon: currentTile.icon,
          progress: currentTile.progress || 0,
          order: currentTile.order,
          template: currentTile.template || undefined,
          templateData: currentTile.templateData || undefined,
        });
      }
      
      // Restore to selected version
      const restoredTile = await storage.updateTile(tileId, {
        title: versionToRestore.title,
        content: versionToRestore.content,
        color: versionToRestore.color,
        icon: versionToRestore.icon,
        progress: versionToRestore.progress || 0,
        order: versionToRestore.order,
        template: versionToRestore.template || undefined,
        templateData: versionToRestore.templateData || undefined,
      });
      
      res.json(restoredTile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // SHARED LINKS (Collaboration)
  // ============================================
  
  // Get shared links for a tile
  app.get("/api/tiles/:tileId/shares", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      const links = await storage.getSharedLinksForTile(tileId);
      res.json(links);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create shared link
  app.post("/api/tiles/:tileId/shares", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      const shareToken = randomBytes(16).toString('hex');
      
      const link = await storage.createSharedLink({
        tileId,
        shareToken,
        isActive: true,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      });
      
      res.status(201).json(link);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update shared link
  app.patch("/api/shares/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate update data
      const updateShareSchema = z.object({
        isActive: z.boolean().optional(),
        expiresAt: z.string().optional(),
      });
      
      const validatedData = updateShareSchema.parse(req.body);
      
      const updateData: any = {};
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
      if (validatedData.expiresAt) updateData.expiresAt = new Date(validatedData.expiresAt);
      
      const link = await storage.updateSharedLink(id, updateData);
      
      if (!link) {
        return res.status(404).json({ error: "Shared link not found" });
      }
      
      res.json(link);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete shared link
  app.delete("/api/shares/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSharedLink(id);
      
      if (!success) {
        return res.status(404).json({ error: "Shared link not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get shared tile by token (public view)
  app.get("/api/shared/:shareToken", async (req, res) => {
    try {
      const { shareToken } = req.params;
      const link = await storage.getSharedLink(shareToken);
      
      if (!link || !link.isActive) {
        return res.status(404).json({ error: "Shared link not found or inactive" });
      }
      
      // Check if link has expired
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(410).json({ error: "Shared link has expired" });
      }
      
      const tile = await storage.getTile(link.tileId);
      
      if (!tile) {
        return res.status(404).json({ error: "Tile not found" });
      }
      
      res.json(tile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // REMINDERS
  // ============================================
  
  // Get reminders for a tile
  app.get("/api/tiles/:tileId/reminders", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      const reminders = await storage.getReminders(tileId);
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get active reminders (for notifications)
  app.get("/api/reminders/active", async (req, res) => {
    try {
      const reminders = await storage.getActiveReminders();
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create reminder
  app.post("/api/tiles/:tileId/reminders", async (req, res) => {
    try {
      const tileId = parseInt(req.params.tileId);
      
      const reminder = await storage.createReminder({
        tileId,
        dueDate: new Date(req.body.dueDate),
        recurring: req.body.recurring || false,
        notified: false,
      });
      
      res.status(201).json(reminder);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update reminder
  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate update data
      const updateReminderSchema = z.object({
        dueDate: z.string().optional(),
        recurring: z.boolean().optional(),
        notified: z.boolean().optional(),
      });
      
      const validatedData = updateReminderSchema.parse(req.body);
      
      const updateData: any = {};
      if (validatedData.dueDate) updateData.dueDate = new Date(validatedData.dueDate);
      if (validatedData.recurring !== undefined) updateData.recurring = validatedData.recurring;
      if (validatedData.notified !== undefined) updateData.notified = validatedData.notified;
      
      const reminder = await storage.updateReminder(id, updateData);
      
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id);
      
      if (!success) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // ANALYTICS
  // ============================================
  
  // Create analytics event
  app.post("/api/analytics", async (req, res) => {
    try {
      const event = await storage.createAnalyticsEvent({
        tileId: req.body.tileId ? parseInt(req.body.tileId) : null,
        eventType: req.body.eventType,
        duration: req.body.duration,
      });
      
      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get analytics events
  app.get("/api/analytics", async (req, res) => {
    try {
      const tileId = req.query.tileId ? parseInt(req.query.tileId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const events = await storage.getAnalyticsEvents(tileId, limit);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
