import { formatDistanceToNow } from "date-fns";
import type { LegacyTile } from "@shared/schema";
import { getIconComponent } from "@/lib/icons";
import { getTextColor, PASTEL_COLORS, normalizeColor } from "@/lib/colors";
import { GripVertical, Palette, AlertCircle, Link2, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { DueDateDisplay, ReminderBadge } from "@/components/DueDateDisplay";
import { getDateInfo } from "@/lib/dateUtils";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

interface TileCardProps {
  tile: LegacyTile;
  onClick: () => void;
  dragListeners?: DraggableSyntheticListeners;
}

export function TileCard({ tile, onClick, dragListeners }: TileCardProps) {
  // Show formatted HTML preview or fallback text
  const hasContent = tile.content && tile.content.trim() !== "";
  const isLargeTile = tile.variant === "large";

  const textColor = getTextColor(tile.color);
  const timestamp = tile.lastUpdated;
  const timeAgo = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : 'just now';
  const IconComponent = getIconComponent(tile.icon);
  const { updateTile, photos, deleteTile } = useApp();
  
  // Get photos for this tile
  const tilePhotos = photos.filter(p => p.tileId === tile.id);

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      className={`relative flex flex-col p-6 rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-left w-full cursor-pointer ${
        isLargeTile ? "min-h-[400px]" : "min-h-[220px]"
      }`}
      style={{
        backgroundColor: tile.color,
        color: textColor,
        borderColor: `${tile.color}dd`,
      }}
      data-testid={`tile-${tile.id}`}
      data-variant={isLargeTile ? "large" : "regular"}
    >
      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <IconComponent className="w-6 h-6 flex-shrink-0" style={{ color: textColor }} />
        <h3 className="text-lg font-semibold leading-tight flex-1">
          {tile.title}
        </h3>
        {/* Color quick-picker */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="p-1"
                aria-label={`Change color for ${tile.title}`}
              >
                <Palette className="w-4 h-4" style={{ color: textColor }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="space-y-2">
                <Label className="text-sm">Tile Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PASTEL_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTile(tile.id, { color: normalizeColor(c) });
                      }}
                      className={`w-8 h-8 rounded transition-all border-2 ${tile.color === c ? 'border-foreground scale-110' : 'border-transparent hover:border-foreground'}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Set color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete "${tile.title}"?`)) {
                deleteTile(tile.id);
              }
            }}
            aria-label={`Delete ${tile.title}`}
            title="Delete tile"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
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
      {hasContent ? (
        <div
          className={`text-sm opacity-90 mb-3 break-words
            [&_ul]:list-disc [&_ul]:list-inside [&_ul]:ml-4 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:ml-4 [&_ol]:space-y-1
            [&_li]:leading-relaxed
            [&_li_ol]:ml-6 [&_li_ul]:ml-6
            [&_li_ol_ol]:ml-8 [&_li_ul_ul]:ml-8
            [&_li_ol_ol_ol]:ml-10 [&_li_ul_ul_ul]:ml-10
            [&_.ql-check-list]:list-none [&_.ql-check-list]:space-y-1
            [&_.ql-check-list_li]:flex [&_.ql-check-list_li]:items-start [&_.ql-check-list_li]:gap-2 [&_.ql-check-list_li]:ml-4
            [&_.ql-check-list_li:before]:content-none
            [&_input.ql-checkbox]:mt-0.5 [&_input.ql-checkbox]:flex-shrink-0 [&_input.ql-checkbox]:pointer-events-none
            [&_strong]:font-bold [&_em]:italic [&_u]:underline
            [&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-3 [&_blockquote]:opacity-70 [&_blockquote]:italic
            [&_code]:bg-black/20 [&_code]:px-2 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
            [&_pre]:bg-black/20 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-xs
            ${isLargeTile ? "line-clamp-[24]" : "line-clamp-6"}`}
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{ __html: tile.content }}
        />
      ) : (
        <div
          className={`flex-1 text-sm opacity-90 mb-3 italic ${
            isLargeTile ? "line-clamp-[24]" : "line-clamp-6"
          }`}
          style={{ color: textColor }}
        >
          No content yet...
        </div>
      )}

      {/* Photos Preview */}
      {tilePhotos.length > 0 && (
        <div className="mb-3">
          <div className={`grid gap-2 ${isLargeTile ? "grid-cols-4" : "grid-cols-2"}`}>
            {tilePhotos.slice(0, isLargeTile ? 4 : 2).map((photo) => (
              <div key={photo.id} className="relative w-full aspect-square rounded border border-current/20">
                <img
                  src={photo.thumbnail}
                  alt={photo.filename || "Photo"}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
          {tilePhotos.length > (isLargeTile ? 4 : 2) && (
            <div className="text-xs opacity-75 mt-2 text-center">
              +{tilePhotos.length - (isLargeTile ? 4 : 2)} more
            </div>
          )}
        </div>
      )}

      {/* Progress Bar (if exists) */}
      {tile.progress !== null && tile.progress !== undefined && tile.progress > 0 && (
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

      {/* Due Date & Reminder Section */}
      <div className="space-y-2 mb-3">
        {tile.dueDate && (
          <DueDateDisplay tile={tile} compact />
        )}
        {tile.reminder && (
          <ReminderBadge tile={tile} />
        )}
      </div>

      {/* Dependencies Section */}
      {tile.dependsOn && tile.dependsOn.length > 0 && (
        <div className="mb-3 p-2 bg-black/10 rounded text-xs">
          <div className="flex items-center gap-1 mb-1">
            <Link2 className="w-3 h-3" />
            <span className="font-medium">Depends on {tile.dependsOn.length}</span>
          </div>
          <div className="text-opacity-75">{tile.dependsOn.length} blocking task{tile.dependsOn.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {/* Subtasks Progress (if has subtasks) */}
      {tile.subtasks && tile.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium mb-1">
            Subtasks: {tile.subtasks.filter(s => s.completed).length}/{tile.subtasks.length}
          </div>
          <div className="h-1 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.round((tile.subtasks.filter(s => s.completed).length / tile.subtasks.length) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs opacity-75 mt-auto">
        {timeAgo}
      </div>
    </div>
  );
}
