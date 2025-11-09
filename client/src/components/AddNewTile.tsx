import { Plus } from "lucide-react";

interface AddNewTileProps {
  onClick: () => void;
}

export function AddNewTile({ onClick }: AddNewTileProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center min-h-[180px] p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 hover:bg-muted/20 hover:border-muted-foreground/50 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-muted-foreground hover:text-foreground group"
      data-testid="button-add-tile"
    >
      <Plus className="w-12 h-12 mb-3 transition-transform group-hover:scale-110" />
      <span className="text-base font-medium">Add New Category</span>
    </button>
  );
}
