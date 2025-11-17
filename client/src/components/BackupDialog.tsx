import { useState } from "react";
import { Download, Upload, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import {
  downloadBackupAsJSON,
  exportTilesAsCSV,
  downloadCSV,
  restoreFromBackup,
  createTimestampedBackup,
  storeBackup,
  getBackups,
  deleteBackup,
} from "@/lib/backupUtils";
import { formatDateTime } from "@/lib/dateUtils";

export function BackupDialog() {
  const { tiles, photos, settings, importData } = useApp();
  const [backups, setBackups] = useState(getBackups());
  const [isExporting, setIsExporting] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const backup = createTimestampedBackup(tiles, photos, settings);
      downloadBackupAsJSON(backup);
      storeBackup(backup);
      setBackups(getBackups());
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    const csv = exportTilesAsCSV(tiles);
    downloadCSV(csv);
  };

  const handleRestoreFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    try {
      const backup = await restoreFromBackup(file);
      importData(JSON.stringify(backup));
      setBackups(getBackups());
    } catch (error) {
      setRestoreError(error instanceof Error ? error.message : "Unknown error");
    }
    e.target.value = "";
  };

  const handleRestoreFromBackup = (backupId: string) => {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return;

    if (confirm("Restore this backup? Current data will be replaced.")) {
      importData(JSON.stringify(backup));
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm("Delete this backup? This cannot be undone.")) {
      deleteBackup(backupId);
      setBackups(getBackups());
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Export and backup your data">
          <Download className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backup & Export</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Export</h3>
            <Button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as JSON
            </Button>
            <Button
              onClick={handleExportCSV}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </div>

          {/* Restore Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Restore</h3>
            <label className="block">
              <Button
                onClick={() => document.getElementById("restore-file-input")?.click()}
                className="w-full justify-start"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Restore from File
              </Button>
              <input
                id="restore-file-input"
                type="file"
                accept=".json"
                onChange={handleRestoreFromFile}
                className="hidden"
              />
            </label>
            {restoreError && <p className="text-sm text-red-500">{restoreError}</p>}
          </div>

          {/* Automatic Backups */}
          {backups.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Saved Backups ({backups.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-xs">
                        {formatDateTime(backup.timestamp)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {backup.tiles.length} tiles
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleRestoreFromBackup(backup.id)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteBackup(backup.id)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
