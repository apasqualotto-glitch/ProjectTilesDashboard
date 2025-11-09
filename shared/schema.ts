import { z } from "zod";

// Tile schema for project management categories
export const tileSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(), // HTML content from rich text editor
  lastUpdated: z.string(), // ISO timestamp
  color: z.string(), // hex color
  icon: z.string(), // emoji or icon name
  progress: z.number().min(0).max(100).optional(), // optional progress percentage
  order: z.number(), // for drag-drop ordering
});

export type Tile = z.infer<typeof tileSchema>;

// Photo schema for the Photos tile
export const photoSchema = z.object({
  id: z.string(),
  tileId: z.string(), // which tile this photo belongs to (usually "photos")
  base64Data: z.string(), // Base64 encoded image
  thumbnail: z.string(), // Base64 encoded thumbnail
  timestamp: z.string(), // ISO timestamp
  caption: z.string().optional(),
});

export type Photo = z.infer<typeof photoSchema>;

// App settings
export const settingsSchema = z.object({
  darkMode: z.boolean(),
  tileOrder: z.array(z.string()), // array of tile IDs in display order
  lastBackup: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;

// Default tiles configuration
export const DEFAULT_TILES: Tile[] = [
  {
    id: "research",
    title: "Research",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#4f46e5", // indigo
    icon: "flask-conical",
    order: 0,
  },
  {
    id: "charters",
    title: "Charters",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#0891b2", // cyan
    icon: "file-text",
    order: 1,
  },
  {
    id: "vessels",
    title: "Vessels",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#0284c7", // blue
    icon: "ship",
    order: 2,
  },
  {
    id: "equipment",
    title: "Equipment",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#7c3aed", // violet
    icon: "settings",
    order: 3,
  },
  {
    id: "operations",
    title: "Operations",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#ea580c", // orange
    icon: "wrench",
    order: 4,
  },
  {
    id: "methodology",
    title: "Methodology",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#16a34a", // green
    icon: "bar-chart",
    order: 5,
  },
  {
    id: "storyboard",
    title: "Storyboard",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#dc2626", // red
    icon: "film",
    order: 6,
  },
  {
    id: "personal",
    title: "Personal",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#db2777", // pink
    icon: "user",
    order: 7,
  },
  {
    id: "photos",
    title: "Photos",
    content: "",
    lastUpdated: new Date().toISOString(),
    color: "#65a30d", // lime
    icon: "camera",
    order: 8,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  tileOrder: DEFAULT_TILES.map(t => t.id),
};
