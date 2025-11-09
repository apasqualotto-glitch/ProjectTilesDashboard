import { useState, useEffect, useRef } from "react";
import { X, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApp } from "@/contexts/AppContext";
import { Tile } from "@shared/schema";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { HexColorPicker } from "react-colorful";
import { getIconComponent } from "@/lib/icons";

interface TileEditorProps {
  tileId: string;
  onClose: () => void;
}

export function TileEditor({ tileId, onClose }: TileEditorProps) {
  const { tiles, updateTile } = useApp();
  const tile = tiles.find(t => t.id === tileId);
  
  const [title, setTitle] = useState(tile?.title || "");
  const [content, setContent] = useState(tile?.content || "");
  const [color, setColor] = useState(tile?.color || "#4f46e5");
  const [progress, setProgress] = useState(tile?.progress || 0);
  const [showProgress, setShowProgress] = useState((tile?.progress || 0) > 0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!tile) return;
    setTitle(tile.title);
    setContent(tile.content);
    setColor(tile.color);
    setProgress(tile.progress || 0);
    setShowProgress((tile.progress || 0) > 0);
  }, [tile]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (!tile || content === tile.content) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content]);

  const handleSave = () => {
    if (!tile) return;
    
    const updates: Partial<Tile> = {
      title,
      content,
      color,
      progress: showProgress ? progress : undefined,
    };
    
    updateTile(tileId, updates);
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleClose = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    handleSave();
    onClose();
  };

  if (!tile) return null;

  // Determine text color based on background brightness
  const getTextColor = (hexColor: string) => {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const textColor = getTextColor(color);
  const IconComponent = getIconComponent(tile?.icon || "folder-open");

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-background shadow-2xl animate-in slide-in-from-right duration-400 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ backgroundColor: color, color: textColor }}
        >
          <div className="flex items-center gap-3 flex-1">
            <IconComponent className="w-6 h-6 flex-shrink-0" style={{ color: textColor }} />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-lg font-semibold bg-transparent border-none focus-visible:ring-0 px-0"
              style={{ color: textColor }}
              data-testid="input-tile-title"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Color Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  style={{ color: textColor }}
                  data-testid="button-color-picker"
                >
                  <Palette className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-3">
                  <Label>Tile Color</Label>
                  <HexColorPicker color={color} onChange={setColor} />
                  <div className="flex items-center gap-2">
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-color-hex"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        handleSave();
                      }}
                      data-testid="button-apply-color"
                    >
                      Apply
                    </Button>
                  </div>
                  {/* Preset colors */}
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      "#4f46e5",
                      "#0891b2",
                      "#0284c7",
                      "#7c3aed",
                      "#ea580c",
                      "#16a34a",
                      "#dc2626",
                      "#db2777",
                      "#65a30d",
                      "#a855f7",
                      "#14b8a6",
                      "#f59e0b",
                    ].map(presetColor => (
                      <button
                        key={presetColor}
                        onClick={() => setColor(presetColor)}
                        className="w-8 h-8 rounded border-2 border-transparent hover:border-foreground transition-colors"
                        style={{ backgroundColor: presetColor }}
                        data-testid={`button-preset-color-${presetColor}`}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              style={{ color: textColor }}
              data-testid="button-close-editor"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar Toggle */}
        <div className="px-6 py-4 border-b bg-muted/50">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="show-progress"
              checked={showProgress}
              onChange={(e) => setShowProgress(e.target.checked)}
              className="w-4 h-4"
              data-testid="checkbox-show-progress"
            />
            <Label htmlFor="show-progress" className="cursor-pointer">
              Show Progress
            </Label>
            {showProgress && (
              <div className="flex items-center gap-3 flex-1">
                <Slider
                  value={[progress]}
                  onValueChange={([value]) => setProgress(value)}
                  max={100}
                  step={1}
                  className="flex-1"
                  data-testid="slider-progress"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {progress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-full"
            placeholder="Start writing..."
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/30 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <span>
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <Button onClick={handleSave} size="sm" data-testid="button-save">
            Save Now
          </Button>
        </div>
      </div>
    </div>
  );
}
