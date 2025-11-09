import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { HexColorPicker } from "react-colorful";
import { AVAILABLE_ICONS, getIconComponent } from "@/lib/icons";

interface AddTileModalProps {
  onClose: () => void;
}

export function AddTileModal({ onClose }: AddTileModalProps) {
  const { addTile } = useApp();
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("folder-open");
  const [color, setColor] = useState("#4f46e5");
  const IconPreview = getIconComponent(icon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTile({
      title: title.trim(),
      icon,
      color,
      content: "",
      lastUpdated: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-background rounded-xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Add New Category</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="tile-title">Category Name</Label>
            <Input
              id="tile-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Marketing, Development, Ideas"
              autoFocus
              data-testid="input-new-tile-title"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-lg">
                <IconPreview className="w-6 h-6" />
              </div>
              <span className="text-sm text-muted-foreground flex-1">
                {icon}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {AVAILABLE_ICONS.map(iconName => {
                const IconComponent = getIconComponent(iconName);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-3 rounded hover:bg-muted transition-colors flex items-center justify-center ${
                      icon === iconName ? "bg-muted ring-2 ring-primary" : ""
                    }`}
                    title={iconName}
                    data-testid={`button-icon-${iconName}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-start gap-4">
              <HexColorPicker color={color} onChange={setColor} />
              <div className="space-y-2 flex-1">
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="font-mono"
                  data-testid="input-new-tile-color"
                />
                <div
                  className="w-full h-16 rounded-lg border-2"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel-new-tile"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!title.trim()}
              data-testid="button-create-tile"
            >
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
