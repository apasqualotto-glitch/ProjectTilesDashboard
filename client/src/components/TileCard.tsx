import { formatDistanceToNow } from "date-fns";
import { Tile } from "@shared/schema";
import { getIconComponent } from "@/lib/icons";
import { GripVertical } from "lucide-react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

interface TileCardProps {
  tile: Tile;
  onClick: () => void;
  dragListeners?: DraggableSyntheticListeners;
}

export function TileCard({ tile, onClick, dragListeners }: TileCardProps) {
  // Get text content from HTML for preview
  const getPreviewText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.trim();
  };

  const previewText = getPreviewText(tile.content);
  const lines = previewText.split("\n").filter(line => line.trim());
  const preview = lines.slice(0, 3).join("\n") || "No content yet...";

  // Determine text color based on background color brightness
  const getTextColor = (hexColor: string) => {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const textColor = getTextColor(tile.color);
  const timeAgo = formatDistanceToNow(new Date(tile.lastUpdated), { addSuffix: true });
  const IconComponent = getIconComponent(tile.icon);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col min-h-[180px] p-6 rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-left w-full"
      style={{
        backgroundColor: tile.color,
        color: textColor,
        borderColor: `${tile.color}dd`,
      }}
      data-testid={`tile-${tile.id}`}
    >
      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <IconComponent className="w-6 h-6 flex-shrink-0" style={{ color: textColor }} />
        <h3 className="text-lg font-semibold leading-tight flex-1">
          {tile.title}
        </h3>
        {/* Drag Handle */}
        {dragListeners && (
          <div
            className="opacity-40 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing focus:outline-none focus:opacity-100"
            {...dragListeners}
            aria-label="Drag to reorder tile"
            data-testid={`drag-handle-${tile.id}`}
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
            role="button"
          >
            <GripVertical className="w-5 h-5" style={{ color: textColor }} />
          </div>
        )}
      </div>

      {/* Content Preview */}
      <div
        className="flex-1 text-sm opacity-90 line-clamp-3 whitespace-pre-wrap mb-3"
        style={{ color: textColor }}
      >
        {preview}
      </div>

      {/* Progress Bar (if exists) */}
      {tile.progress !== undefined && tile.progress > 0 && (
        <div className="mb-3">
          <div className="h-1 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-black/40 dark:bg-white/40 rounded-full transition-all duration-300"
              style={{ width: `${tile.progress}%` }}
            />
          </div>
          <span className="text-xs opacity-75 mt-1 block">
            {tile.progress}% complete
          </span>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs opacity-75 mt-auto">
        {timeAgo}
      </div>
    </button>
  );
}
