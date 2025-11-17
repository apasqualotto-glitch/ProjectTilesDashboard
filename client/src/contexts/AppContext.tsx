import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEFAULT_TILES, DEFAULT_SETTINGS, type LegacyTile, type LegacyPhoto, type LegacySettings } from "@shared/schema";
import { normalizeColor } from "@/lib/colors";
import { getDateInfo } from "@/lib/dateUtils";
import type { AppNotification } from "@/lib/notificationUtils";

interface AppContextType {
  tiles: LegacyTile[];
  photos: LegacyPhoto[];
  settings: LegacySettings;
  notifications: AppNotification[];
  darkMode: boolean;
  updateTile: (id: string, updates: Partial<LegacyTile>) => void;
  addTile: (tile: Omit<LegacyTile, "id" | "order">) => void;
  deleteTile: (id: string) => void;
  addPhoto: (photo: Omit<LegacyPhoto, "id">) => void;
  deletePhoto: (id: string) => void;
  toggleDarkMode: () => void;
  reorderTiles: (newOrder: string[]) => void;
  exportData: () => void;
  importData: (jsonString: string) => void;
  resetData: () => void;
  // New methods for enhanced features
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  clearNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  getOverdueTiles: () => LegacyTile[];
  getDueSoonTiles: () => LegacyTile[];
  getTilesByDependency: (tileId: string) => LegacyTile[];
  getBlockingTiles: (tileId: string) => LegacyTile[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TILES: "projectos_tiles",
  PHOTOS: "projectos_photos",
  SETTINGS: "projectos_settings",
};

// Migration map from old emoji to new icon names
const EMOJI_TO_ICON_MAP: Record<string, string> = {
  "🔬": "flask-conical",
  "📋": "file-text",
  "🚢": "ship",
  "⚙️": "settings",
  "🔧": "wrench",
  "📊": "bar-chart",
  "🎬": "film",
  "👤": "user",
  "📷": "camera",
  "📁": "folder-open",
};

// Migrate old emoji icons to new icon names
function migrateEmojiToIcon(icon: string): string {
  // If it's a known emoji, return the mapped icon
  if (EMOJI_TO_ICON_MAP[icon]) {
    return EMOJI_TO_ICON_MAP[icon];
  }
  
  // If it's already a valid icon name (contains only letters, numbers, and hyphens), keep it
  if (/^[a-z0-9-]+$/.test(icon)) {
    return icon;
  }
  
  // Otherwise, it's an unsupported emoji or invalid value - use fallback
  console.warn(`Migrating unsupported icon "${icon}" to "folder-open"`);
  return "folder-open";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tiles, setTiles] = useState<LegacyTile[]>([]);
  const [photos, setPhotos] = useState<LegacyPhoto[]>([]);
  const [settings, setSettings] = useState<LegacySettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTiles = localStorage.getItem(STORAGE_KEYS.TILES);
    const storedPhotos = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (storedTiles) {
      try {
        const parsedTiles = JSON.parse(storedTiles);
        
        // Migrate old emoji icons to new icon names and add variant to special tiles
        const migratedTiles = parsedTiles.map((tile: LegacyTile) => {
          const updated = {
            ...tile,
            icon: migrateEmojiToIcon(tile.icon),
            // Normalize any existing colors to the pastel palette (safer migration)
            color: normalizeColor(tile.color || ""),
          };
          // Ensure todo-notes tile has the large variant
          if (tile.id === "todo-notes" && !tile.variant) {
            updated.variant = "large";
          }
          return updated;
        });
        
        // Backfill any missing default tiles (e.g., todo-notes for existing users)
  const existingIds = new Set(migratedTiles.map((t: LegacyTile) => t.id));
  const missingTiles = DEFAULT_TILES.filter(defaultTile => !existingIds.has(defaultTile.id));
        
        if (missingTiles.length > 0) {
          // Add missing tiles at the end, preserving their order values
          const maxOrder = Math.max(...migratedTiles.map((t: LegacyTile) => t.order), -1);
          const tilesWithMissing = [
            ...migratedTiles,
            ...missingTiles.map((tile, index) => ({
              ...tile,
              order: maxOrder + 1 + index,
            }))
          ];
          setTiles(tilesWithMissing);
        } else {
          setTiles(migratedTiles);
        }
      } catch (e) {
        console.error("Error parsing tiles:", e);
        setTiles(DEFAULT_TILES);
      }
    } else {
      setTiles(DEFAULT_TILES);
    }

    if (storedPhotos) {
      try {
        setPhotos(JSON.parse(storedPhotos));
      } catch (e) {
        console.error("Error parsing photos:", e);
        setPhotos([]);
      }
    }

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        if (parsed.darkMode) {
          document.documentElement.classList.add("dark");
        }
      } catch (e) {
        console.error("Error parsing settings:", e);
        setSettings(DEFAULT_SETTINGS);
      }
    }

    setIsInitialized(true);
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.TILES, JSON.stringify(tiles));
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [tiles, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
  }, [photos, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, isInitialized]);

  const updateTile = (id: string, updates: Partial<LegacyTile>) => {
    setTiles(prev =>
      prev.map(tile =>
        tile.id === id
          ? { ...tile, ...updates, color: updates.color ? normalizeColor(updates.color) : tile.color, lastUpdated: new Date().toISOString() }
          : tile
      )
    );
  };

  const addTile = (tileData: Omit<LegacyTile, "id" | "order">) => {
    const newTile: LegacyTile = {
      ...tileData,
      id: `tile_${Date.now()}`,
      order: tiles.length,
      lastUpdated: new Date().toISOString(),
      color: normalizeColor(tileData.color || ""),
    };
    setTiles(prev => [...prev, newTile]);
    setSettings(prev => ({
      ...prev,
      tileOrder: [...prev.tileOrder, newTile.id],
    }));
  };

  const deleteTile = (id: string) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
    setSettings(prev => ({
      ...prev,
      tileOrder: prev.tileOrder.filter(tileId => tileId !== id),
    }));
  };

  const addPhoto = (photoData: Omit<LegacyPhoto, "id">) => {
    const newPhoto: LegacyPhoto = {
      ...photoData,
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const toggleDarkMode = () => {
    setSettings(prev => {
      const newDarkMode = !prev.darkMode;
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { ...prev, darkMode: newDarkMode };
    });
  };

  const reorderTiles = (reorderedSubsetIds: string[]) => {
    setTiles(prev => {
      // Get all tiles sorted by current order
      const sortedByOrder = [...prev].sort((a, b) => a.order - b.order);
      const allRegularTiles = sortedByOrder.filter(t => t.variant !== "large");
      const largeTiles = sortedByOrder.filter(t => t.variant === "large");
      
      // Create a map of tile IDs to tile objects for quick lookup
      const tileMap = new Map(allRegularTiles.map(t => [t.id, t]));
      
      // Build new regular order by walking the original array
      // and replacing only the tiles that appear in reorderedSubsetIds
      const newRegularOrder: typeof allRegularTiles = [];
      let reorderedIndex = 0; // Index into reorderedSubsetIds array
      
      for (const tile of allRegularTiles) {
        if (reorderedSubsetIds.includes(tile.id) && reorderedIndex < reorderedSubsetIds.length) {
          // This tile is being reordered - use the next tile from reorderedSubsetIds
          const nextReorderedId = reorderedSubsetIds[reorderedIndex];
          newRegularOrder.push({ ...tileMap.get(nextReorderedId)! }); // Clone to avoid ref issues
          reorderedIndex++;
        } else {
          // This tile is not being reordered - keep it in place
          newRegularOrder.push({ ...tile }); // Clone to avoid ref issues
        }
      }
      
      // Assign sequential order values
      const reindexedRegular = newRegularOrder.map((tile, index) => ({
        ...tile,
        order: index,
      }));
      
      // Append large tiles with higher order values
      const reindexedLarge = largeTiles.map((tile, index) => ({
        ...tile,
        order: reindexedRegular.length + index,
      }));
      
      const combined = [...reindexedRegular, ...reindexedLarge];
      
      // Persist
      const fullOrder = combined.map(t => t.id);
      setSettings(prev => ({ ...prev, tileOrder: fullOrder }));
      
      return combined;
    });
  };

  const exportData = () => {
    const data = {
      tiles,
      photos,
      settings: { ...settings, lastBackup: new Date().toISOString() },
      version: "1.0",
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-os-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Migrate tiles to ensure no emoji icons and add variant to special tiles
      if (data.tiles) {
        const migratedTiles = data.tiles.map((tile: LegacyTile) => {
          const updated = {
            ...tile,
            icon: migrateEmojiToIcon(tile.icon),
          };
          // Ensure todo-notes tile has the large variant
          if (tile.id === "todo-notes" && !tile.variant) {
            updated.variant = "large";
          }
          return updated;
        });
        setTiles(migratedTiles);
      }
      
      if (data.photos) setPhotos(data.photos);
      
      if (data.settings) {
        setSettings(data.settings);
        if (data.settings.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (e) {
      console.error("Error importing data:", e);
      throw new Error("Invalid JSON file");
    }
  };

  const resetData = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      setTiles(DEFAULT_TILES);
      setPhotos([]);
      setSettings(DEFAULT_SETTINGS);
      document.documentElement.classList.remove("dark");
      localStorage.clear();
    }
  };

  // New methods for notifications
  const addNotification = (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep only last 50
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Helper methods for date-based filtering
  const getOverdueTiles = (): LegacyTile[] => {
    return tiles.filter((tile) => {
      if (!tile.dueDate) return false;
      const dateInfo = getDateInfo(tile.dueDate);
      return dateInfo?.isOverdue ?? false;
    });
  };

  const getDueSoonTiles = (): LegacyTile[] => {
    return tiles.filter((tile) => {
      if (!tile.dueDate) return false;
      const dateInfo = getDateInfo(tile.dueDate);
      return (dateInfo?.isDueToday || dateInfo?.isDueSoon) ?? false;
    });
  };

  // Helper methods for dependencies
  const getTilesByDependency = (tileId: string): LegacyTile[] => {
    return tiles.filter((tile) => tile.dependsOn?.includes(tileId) ?? false);
  };

  const getBlockingTiles = (tileId: string): LegacyTile[] => {
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile?.dependsOn) return [];
    return tiles.filter((t) => tile.dependsOn?.includes(t.id) ?? false);
  };

  const value = {
    tiles,
    photos,
    settings,
    notifications,
    darkMode: settings.darkMode,
    updateTile,
    addTile,
    deleteTile,
    addPhoto,
    deletePhoto,
    toggleDarkMode,
    reorderTiles,
    exportData,
    importData,
    resetData,
    addNotification,
    clearNotifications,
    markNotificationAsRead,
    getOverdueTiles,
    getDueSoonTiles,
    getTilesByDependency,
    getBlockingTiles,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
