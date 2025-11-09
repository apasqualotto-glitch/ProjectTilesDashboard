import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Tile, Photo, Settings, DEFAULT_TILES, DEFAULT_SETTINGS } from "@shared/schema";

interface AppContextType {
  tiles: Tile[];
  photos: Photo[];
  settings: Settings;
  darkMode: boolean;
  updateTile: (id: string, updates: Partial<Tile>) => void;
  addTile: (tile: Omit<Tile, "id" | "order">) => void;
  deleteTile: (id: string) => void;
  addPhoto: (photo: Omit<Photo, "id">) => void;
  deletePhoto: (id: string) => void;
  toggleDarkMode: () => void;
  reorderTiles: (newOrder: string[]) => void;
  exportData: () => void;
  importData: (jsonString: string) => void;
  resetData: () => void;
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
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTiles = localStorage.getItem(STORAGE_KEYS.TILES);
    const storedPhotos = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (storedTiles) {
      try {
        const parsedTiles = JSON.parse(storedTiles);
        // Migrate old emoji icons to new icon names
        const migratedTiles = parsedTiles.map((tile: Tile) => ({
          ...tile,
          icon: migrateEmojiToIcon(tile.icon),
        }));
        setTiles(migratedTiles);
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

  const updateTile = (id: string, updates: Partial<Tile>) => {
    setTiles(prev =>
      prev.map(tile =>
        tile.id === id
          ? { ...tile, ...updates, lastUpdated: new Date().toISOString() }
          : tile
      )
    );
  };

  const addTile = (tileData: Omit<Tile, "id" | "order">) => {
    const newTile: Tile = {
      ...tileData,
      id: `tile_${Date.now()}`,
      order: tiles.length,
      lastUpdated: new Date().toISOString(),
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

  const addPhoto = (photoData: Omit<Photo, "id">) => {
    const newPhoto: Photo = {
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

  const reorderTiles = (newOrder: string[]) => {
    setSettings(prev => ({ ...prev, tileOrder: newOrder }));
    setTiles(prev => {
      const reordered = [...prev];
      reordered.sort((a, b) => {
        const aIndex = newOrder.indexOf(a.id);
        const bIndex = newOrder.indexOf(b.id);
        return aIndex - bIndex;
      });
      return reordered.map((tile, index) => ({ ...tile, order: index }));
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
      
      // Migrate tiles to ensure no emoji icons
      if (data.tiles) {
        const migratedTiles = data.tiles.map((tile: Tile) => ({
          ...tile,
          icon: migrateEmojiToIcon(tile.icon),
        }));
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

  const value = {
    tiles,
    photos,
    settings,
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
