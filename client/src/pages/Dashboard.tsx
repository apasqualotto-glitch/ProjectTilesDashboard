import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Header } from "@/components/Header";
import { TileCard } from "@/components/TileCard";
import { AddNewTile } from "@/components/AddNewTile";
import { TileEditor } from "@/components/TileEditor";
import { PhotoUpload } from "@/components/PhotoUpload";
import { AddTileModal } from "@/components/AddTileModal";
import { Timeline } from "@/components/Timeline";
import { QuickNotes } from "@/components/QuickNotes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTile({ tile, onClick }: { tile: any; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: tile.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TileCard tile={tile} onClick={onClick} dragListeners={listeners} />
    </div>
  );
}

export default function Dashboard() {
  const { tiles, reorderTiles } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"dashboard" | "timeline">("dashboard");
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [showAddTileModal, setShowAddTileModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort all tiles by order first
  const sortedAllTiles = [...tiles].sort((a, b) => a.order - b.order);
  
  // Separate ALL regular and large tiles (unfiltered - for drag operations)
  const allRegularTiles = sortedAllTiles.filter(tile => tile.variant !== "large");
  const allLargeTiles = sortedAllTiles.filter(tile => tile.variant === "large");
  
  // Filter tiles based on search query (for display)
  const filteredTiles = sortedAllTiles.filter(tile => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = tile.title.toLowerCase().includes(query);
    
    // Extract text from HTML content
    const div = document.createElement("div");
    div.innerHTML = tile.content;
    const contentText = (div.textContent || div.innerText || "").toLowerCase();
    const contentMatch = contentText.includes(query);
    
    return titleMatch || contentMatch;
  });

  // Separate filtered tiles for display
  const displayRegularTiles = filteredTiles.filter(tile => tile.variant !== "large");
  const displayLargeTiles = filteredTiles.filter(tile => tile.variant === "large");

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Reorder only the visible/filtered tiles
      const oldIndex = displayRegularTiles.findIndex(t => t.id === active.id);
      const newIndex = displayRegularTiles.findIndex(t => t.id === over.id);
      
      const newOrder = arrayMove(displayRegularTiles, oldIndex, newIndex);
      // Pass only the reordered visible tiles
      reorderTiles(newOrder.map(t => t.id));
    }
  };

  const handleTileClick = (tileId: string) => {
    // Special handling for photos tile
    if (tileId === "photos") {
      setShowPhotoModal(true);
    } else {
      setSelectedTileId(tileId);
    }
  };

  if (currentView === "timeline") {
    return (
      <div className="min-h-screen bg-background">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Timeline />
        </div>
        <QuickNotes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Regular Tiles Grid with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayRegularTiles.map(t => t.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {displayRegularTiles.map(tile => (
                <SortableTile
                  key={tile.id}
                  tile={tile}
                  onClick={() => handleTileClick(tile.id)}
                />
              ))}
              <AddNewTile onClick={() => setShowAddTileModal(true)} />
            </div>
          </SortableContext>
        </DndContext>
        
        {/* Large Tiles Section (3x2 grid spaces) */}
        {displayLargeTiles.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayLargeTiles.map(tile => (
                <div
                  key={tile.id}
                  className="sm:col-span-2 lg:col-span-3"
                  style={{ minHeight: "400px" }}
                  data-testid={`large-tile-${tile.id}`}
                >
                  <TileCard tile={tile} onClick={() => handleTileClick(tile.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTiles.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No tiles found for "{searchQuery}"
            </p>
          </div>
        )}
      </main>

      {/* Tile Editor */}
      {selectedTileId && selectedTileId !== "photos" && (
        <TileEditor
          tileId={selectedTileId}
          onClose={() => setSelectedTileId(null)}
        />
      )}

      {/* Photo Upload Modal */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              Photos
            </DialogTitle>
          </DialogHeader>
          <PhotoUpload tileId="photos" />
        </DialogContent>
      </Dialog>

      {/* Add New Tile Modal */}
      {showAddTileModal && (
        <AddTileModal onClose={() => setShowAddTileModal(false)} />
      )}

      {/* Quick Notes Floating Button */}
      <QuickNotes />
    </div>
  );
}
