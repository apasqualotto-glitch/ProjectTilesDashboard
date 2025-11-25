import { useState, useEffect, useRef } from "react";
import { X, Palette, Save, Upload, Trash2, Image as ImageIcon, Download, Calendar, Repeat, Link2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApp } from "@/contexts/AppContext";
import type { LegacyTile, ReminderConfig } from "@shared/schema";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { PASTEL_COLORS, DEFAULT_PASTEL_COLOR, getTextColor as getPastelTextColor, normalizeColor } from "@/lib/colors";
import { getIconComponent } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";
import { SubtaskManager } from "@/components/SubtaskManager";
import { DependencyManager } from "@/components/DependencyManager";
import { DueDateDisplay } from "@/components/DueDateDisplay";
import { dateToISO } from "@/lib/dateUtils";
// line-metadata removed per rollback request

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
  const [color, setColor] = useState<string>(normalizeColor(tile?.color || DEFAULT_PASTEL_COLOR));
  const [progress, setProgress] = useState(tile?.progress || 0);
  const [showProgress, setShowProgress] = useState((tile?.progress || 0) > 0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dueDate, setDueDate] = useState<string>(tile?.dueDate || "");
  const [reminderType, setReminderType] = useState<"daily" | "weekly" | "monthly" | null>(
    tile?.reminder?.recurring || null
  );
  const [dependsOn, setDependsOn] = useState<string[]>(tile?.dependsOn || []);
  const [subtasks, setSubtasks] = useState(tile?.subtasks || []);
  const [activeTab, setActiveTab] = useState<"content" | "dates" | "subtasks" | "dependencies" | "photos">("content");
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
    setDueDate(tile.dueDate || "");
    setReminderType(tile.reminder?.recurring || null);
    setDependsOn(tile.dependsOn || []);
    setSubtasks(tile.subtasks || []);
    // line metadata removed during rollback
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
      dueDate: dueDate || undefined,
      reminder: dueDate && reminderType ? { dueDate, recurring: reminderType } : undefined,
      dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
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

      try {
        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          // Create thumbnail (resize to 200x200) for images, otherwise a placeholder
          let thumbnail: string;
          if (file.type.startsWith('image/')) {
            thumbnail = await createThumbnail(base64Data);
          } else {
            // create a simple placeholder thumbnail showing the file extension
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 200;
            canvas.width = MAX_SIZE;
            canvas.height = MAX_SIZE;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#f3f4f6';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#111827';
              ctx.font = 'bold 36px sans-serif';
              const ext = (file.name.split('.').pop() || '').toUpperCase();
              const text = ext || 'FILE';
              const metrics = ctx.measureText(text);
              const x = (canvas.width - metrics.width) / 2;
              const y = (canvas.height + 12) / 2;
              ctx.fillText(text, x, y);
            }
            thumbnail = canvas.toDataURL('image/png');
          }

          addPhoto({
            tileId,
            base64Data,
            thumbnail,
            caption: "",
            timestamp: new Date().toISOString(),
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
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

  const textColor = getPastelTextColor(color);
  const IconComponent = getIconComponent(tile?.icon || "folder-open");

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-background shadow-2xl animate-in slide-in-from-right duration-400 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
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
            {/* Pastel Color Picker */}
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
              <PopoverContent className="w-auto p-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Choose a Pastel Color</Label>
                  {/* Pastel colors grid - 4 columns */}
                  <div className="grid grid-cols-4 gap-3">
                    {PASTEL_COLORS.map((pastelColor) => (
                      <button
                        key={pastelColor}
                        onClick={() => {
                          setColor(pastelColor);
                          handleSave();
                        }}
                        className={`w-10 h-10 rounded-lg transition-all border-2 ${
                          color === pastelColor
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:border-foreground'
                        }`}
                        style={{ backgroundColor: pastelColor }}
                        title={pastelColor}
                        data-testid={`button-pastel-color-${pastelColor}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {color}
                  </p>
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

        {/* Toolbar - Feature Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b bg-muted/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "content"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab("dates")}
            className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === "dates"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Due Date
          </button>
          <button
            onClick={() => setActiveTab("subtasks")}
            className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "subtasks"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Subtasks
          </button>
          <button
            onClick={() => setActiveTab("dependencies")}
            className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === "dependencies"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Link2 className="w-4 h-4" />
            Depends
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === "photos"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Photos & Files ({tilePhotos.length})
          </button>
        </div>

        {/* Content Area - Tabbed */}
        <div className="flex-1 overflow-y-auto">
          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="h-full flex flex-col">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="flex-1"
                placeholder="Start writing..."
              />

              {/* Progress Bar - inline with editor */}
              <div className="px-6 py-4 border-t bg-muted/50 space-y-3">
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
            </div>
          )}

          {/* Due Date Tab */}
          {activeTab === "dates" && (
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2"
                />
                {dueDate && (
                  <div className="mt-3">
                    <DueDateDisplay tile={{ ...tile, dueDate }} />
                  </div>
                )}
              </div>

              {dueDate && (
                <div>
                  <Label className="text-sm font-medium">Reminder</Label>
                  <select
                    value={reminderType || ""}
                    onChange={(e) =>
                      setReminderType(
                        (e.target.value as "daily" | "weekly" | "monthly") || null
                      )
                    }
                    className="w-full px-3 py-2 rounded border border-input bg-background mt-2"
                  >
                    <option value="">No reminder</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {reminderType && (
                    <p className="text-sm text-muted-foreground mt-2">
                      🔔 You'll get a {reminderType} reminder starting {dueDate}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === "subtasks" && (
            <div className="p-6">
              <SubtaskManager subtasks={subtasks} onChange={setSubtasks} />
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === "dependencies" && (
            <div className="p-6">
              <DependencyManager
                currentTileId={tileId}
                dependsOn={dependsOn}
                onChange={setDependsOn}
              />
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <div className="p-6 space-y-4">
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
                  accept="*/*"
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
                      className="relative group aspect-square rounded-lg overflow-visible border bg-card hover:shadow-lg transition-shadow"
                      data-testid={`photo-${photo.id}`}
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.caption || "Photo"}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = photo.base64Data;
                        a.target = '_blank';
                        a.click();
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="h-12 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          const a = document.createElement('a');
                          a.href = photo.base64Data;
                          a.target = '_blank';
                          a.click();
                        }}
                        title="Open file"
                        data-testid={`button-open-photo-${photo.id}`}
                      >
                        <ImageIcon className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="h-12 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          const orig = photo.filename;
                          const filename = orig ? orig : `photo-${photo.id}`;
                          const a = document.createElement('a');
                          a.href = photo.base64Data;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        title="Download file"
                        data-testid={`button-download-photo-${photo.id}`}
                      >
                        <Download className="w-6 h-6" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="absolute top-2 right-2 h-10 w-10 bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this file?')) {
                          handleDeletePhoto(photo.id);
                        }
                      }}
                      title="Delete file"
                      data-testid={`button-delete-photo-${photo.id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
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
          )}
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
