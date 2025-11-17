import { formatDistanceToNow } from "date-fns";
import { useApp } from "@/contexts/AppContext";
import type { LegacyTile } from "@shared/schema";
import { getIconComponent } from "@/lib/icons";

export function Timeline() {
  const { tiles } = useApp();

  // Sort tiles by last updated (most recent first)
  const sortedByUpdate = [...tiles].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  // Get text preview from HTML content
  const getPreviewText = (html: string, maxLength = 150) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.trim().substring(0, maxLength) + (text.length > maxLength ? "..." : "");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Activity Timeline</h2>
        <p className="text-muted-foreground">
          Chronological view of all updates across your categories
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sortedByUpdate.map((tile: LegacyTile) => {
          const timeAgo = formatDistanceToNow(new Date(tile.lastUpdated), {
            addSuffix: true,
          });
          const IconComponent = getIconComponent(tile.icon);

          return (
            <div
              key={tile.id}
              className="relative pl-8 pb-8 border-l-2 last:pb-0"
              style={{ borderColor: tile.color }}
              data-testid={`timeline-${tile.id}`}
            >
              {/* Icon dot */}
              <div
                className="absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: tile.color }}
              >
                <IconComponent className="w-4 h-4" style={{ color: "#ffffff" }} />
              </div>

              {/* Content Card */}
              <div className="bg-card border border-card-border rounded-lg p-4 ml-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {tile.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo}
                  </span>
                </div>

                {tile.content && (
                  <p className="text-sm text-muted-foreground">
                    {getPreviewText(tile.content)}
                  </p>
                )}

                {tile.progress !== undefined && tile.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{tile.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${tile.progress}%`,
                          backgroundColor: tile.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedByUpdate.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No activity yet. Start creating and updating tiles!
          </p>
        </div>
      )}
    </div>
  );
}
