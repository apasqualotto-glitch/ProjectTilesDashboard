/**
 * Export and backup utilities for tiles and data
 */

export interface BackupData {
  version: number;
  timestamp: string;
  tiles: any[];
  photos: any[];
  settings: any;
}

/**
 * Create a JSON backup of all tile data
 */
export function createBackup(tiles: any[], photos: any[], settings: any): BackupData {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    tiles,
    photos,
    settings,
  };
}

/**
 * Export backup as JSON file (triggers download)
 */
export function downloadBackupAsJSON(backup: BackupData, filename?: string): void {
  const data = JSON.stringify(backup, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `tiles-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export tiles as CSV (simple format)
 */
export function exportTilesAsCSV(tiles: any[]): string {
  const headers = ["Title", "Status", "Priority", "Due Date", "Content (first 100 chars)"];
  const rows = tiles.map((tile) => [
    tile.title,
    tile.status || "N/A",
    tile.priority || "N/A",
    tile.dueDate || "N/A",
    tile.content.substring(0, 100).replace(/,/g, ";").replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename?: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `tiles-export-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Restore from backup file
 */
export function restoreFromBackup(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.version && data.timestamp && data.tiles !== undefined) {
          resolve(data as BackupData);
        } else {
          reject(new Error("Invalid backup file format"));
        }
      } catch (error) {
        reject(new Error("Failed to parse backup file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Create timestamped backups array for storage
 */
export interface TimestampedBackup extends BackupData {
  id: string;
}

export function createTimestampedBackup(tiles: any[], photos: any[], settings: any): TimestampedBackup {
  const backup = createBackup(tiles, photos, settings);
  return {
    ...backup,
    id: `backup-${Date.now()}`,
  };
}

/**
 * Store backup in localStorage (with limit of 10 backups)
 */
export function storeBackup(backup: TimestampedBackup, maxBackups: number = 10): void {
  const key = "tiles_backups";
  const existing = JSON.parse(localStorage.getItem(key) || "[]") as TimestampedBackup[];

  // Add new backup and sort by timestamp (newest first)
  existing.push(backup);
  existing.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Keep only the latest N backups
  const trimmed = existing.slice(0, maxBackups);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

/**
 * Get all stored backups
 */
export function getBackups(): TimestampedBackup[] {
  const key = "tiles_backups";
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as TimestampedBackup[];
  } catch {
    return [];
  }
}

/**
 * Delete a stored backup
 */
export function deleteBackup(backupId: string): void {
  const key = "tiles_backups";
  const backups = getBackups().filter((b) => b.id !== backupId);
  localStorage.setItem(key, JSON.stringify(backups));
}
