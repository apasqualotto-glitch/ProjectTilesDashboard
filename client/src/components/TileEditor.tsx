import { useState, useEffect, useRef } from "react";
import { X, Palette, Save, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApp } from "@/contexts/AppContext";
import type { LegacyTile } from "@shared/schema";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { HexColorPicker } from "react-colorful";
import { getIconComponent } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

interface TileEditorProps {
  tileId: string;
  onClose: () => void;
}

export function TileEditor({ tileId, onClose }: TileEditorProps) {
  const { tiles, updateTile, photos, addPhoto, deletePhoto } = useApp();
  const tile = tiles.find(t => t.id === tileId);
  const { toast } = useToast();
  
  const [title, setTitle] = useState(tile?.title || "");
  const [content, setContent] = useState(tile?.content || "");
  const [color, setColor] = useState(tile?.color || "#4f46e5");
  const [progress, setProgress] = useState(tile?.progress || 0);
  const [showProgress, setShowProgress] = useState((tile?.progress || 0) > 0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get photos for this tile
  const tilePhotos = photos.filter(p => p.tileId === tileId);

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
    
    const updates: Partial<LegacyTile> = {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        continue;
      }

      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          
          // Create thumbnail (resize to 200x200)
          const thumbnail = await createThumbnail(base64Data);
          
          addPhoto({
            tileId,
            base64Data,
            thumbnail,
            caption: "",
            timestamp: new Date().toISOString(),
          });

          toast({
            title: "Photo uploaded",
            description: `${file.name} has been added`,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload failed",
          description: `Could not upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createThumbnail = (base64Data: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64Data;
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(photoId);
    toast({
      title: "Photo deleted",
      description: "Photo has been removed from this tile",
    });
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
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
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
        <div className="flex-1 overflow-y-auto">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-[400px]"
            placeholder="Start writing..."
          />
          
          {/* Photos Section */}
          <div className="p-6 border-t bg-muted/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <h3 className="font-semibold">Photos & Files</h3>
                <span className="text-sm text-muted-foreground">({tilePhotos.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload-photo"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
            </div>

            {tilePhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tilePhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-shadow"
                    data-testid={`photo-${photo.id}`}
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.caption || "Photo"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeletePhoto(photo.id)}
                        data-testid={`button-delete-photo-${photo.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No photos yet</p>
                <p className="text-sm">Click Upload to add photos to this tile</p>
              </div>
            )}
          </div>
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
