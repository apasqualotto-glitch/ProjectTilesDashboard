import { useState } from "react";
import { Plus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { getIconComponent } from "@/lib/icons";

export function QuickNotes() {
  const { tiles, updateTile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [selectedTileId, setSelectedTileId] = useState<string>("");

  const handleSubmit = () => {
    if (!note.trim() || !selectedTileId) return;

    const tile = tiles.find(t => t.id === selectedTileId);
    if (!tile) return;

    // Append note as a new paragraph
    const newContent = tile.content
      ? `${tile.content}<p>• ${note.trim()}</p>`
      : `<p>• ${note.trim()}</p>`;

    updateTile(selectedTileId, { content: newContent });
    
    setNote("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 group"
        data-testid="button-quick-notes"
        title="Quick Notes"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-background border border-border rounded-xl shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-foreground">Quick Note</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(false);
            setNote("");
          }}
          data-testid="button-close-quick-notes"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        <Select value={selectedTileId} onValueChange={setSelectedTileId}>
          <SelectTrigger data-testid="select-tile">
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            {tiles.map(tile => {
              const IconComponent = getIconComponent(tile.icon);
              return (
                <SelectItem key={tile.id} value={tile.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span>{tile.title}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type your note here..."
          rows={4}
          className="resize-none"
          data-testid="textarea-quick-note"
        />

        <Button
          onClick={handleSubmit}
          disabled={!note.trim() || !selectedTileId}
          className="w-full"
          data-testid="button-add-quick-note"
        >
          <Send className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>
    </div>
  );
}
