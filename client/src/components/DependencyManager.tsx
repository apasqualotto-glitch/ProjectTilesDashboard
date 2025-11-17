import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import type { LegacyTile } from "@shared/schema";

interface DependencyManagerProps {
  currentTileId: string;
  dependsOn: string[] | undefined;
  onChange: (dependsOn: string[]) => void;
}

export function DependencyManager({ currentTileId, dependsOn = [], onChange }: DependencyManagerProps) {
  const { tiles } = useApp();

  // Get available tiles (exclude current tile and already selected)
  const availableTiles = tiles.filter(
    (t) => t.id !== currentTileId && !dependsOn.includes(t.id)
  );

  const selectedTiles = tiles.filter((t) => dependsOn.includes(t.id));

  const handleAddDependency = (tileId: string) => {
    onChange([...dependsOn, tileId]);
  };

  const handleRemoveDependency = (tileId: string) => {
    onChange(dependsOn.filter((id) => id !== tileId));
  };

  return (
    <div className="space-y-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
      <div>
        <h4 className="font-semibold text-sm mb-2">Dependencies</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          This tile depends on the selected tiles being completed
        </p>
      </div>

      {selectedTiles.length > 0 && (
        <div className="space-y-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          {selectedTiles.map((tile) => (
            <div
              key={tile.id}
              className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tile.color }}
              />
              <span className="text-sm font-medium flex-1 ml-2">{tile.title}</span>
              <button
                onClick={() => handleRemoveDependency(tile.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {availableTiles.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Add dependency
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleAddDependency(tile.id)}
                className="flex items-center gap-2 p-2 text-left text-sm hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tile.color }}
                />
                <span className="truncate">{tile.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {dependsOn.length === 0 && (
        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">
          No dependencies. This tile can be worked on independently.
        </div>
      )}
    </div>
  );
}
