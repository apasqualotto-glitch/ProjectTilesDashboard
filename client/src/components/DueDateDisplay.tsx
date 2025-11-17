import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { getDateInfo } from "@/lib/dateUtils";
import type { LegacyTile } from "@shared/schema";

interface DueDateDisplayProps {
  tile: LegacyTile;
  compact?: boolean;
}

export function DueDateDisplay({ tile, compact = false }: DueDateDisplayProps) {
  if (!tile.dueDate) return null;

  const dateInfo = getDateInfo(tile.dueDate);
  if (!dateInfo) return null;

  const colorClasses = {
    error: "text-red-500 dark:text-red-400",
    warning: "text-amber-500 dark:text-amber-400",
    success: "text-green-500 dark:text-green-400",
    default: "text-gray-600 dark:text-gray-400",
  };

  const bgClasses = {
    error: "bg-red-50 dark:bg-red-950/30",
    warning: "bg-amber-50 dark:bg-amber-950/30",
    success: "bg-green-50 dark:bg-green-950/30",
    default: "bg-gray-50 dark:bg-gray-950/30",
  };

  const Icon =
    dateInfo.color === "error"
      ? AlertCircle
      : dateInfo.color === "warning"
        ? Clock
        : CheckCircle2;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClasses[dateInfo.color]} ${bgClasses[dateInfo.color]}`}>
        <Icon className="w-3 h-3" />
        <span>{dateInfo.label}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 p-2 rounded ${bgClasses[dateInfo.color]}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClasses[dateInfo.color]}`} />
      <div className={`text-xs font-medium ${colorClasses[dateInfo.color]}`}>{dateInfo.label}</div>
    </div>
  );
}

export function ReminderBadge({ tile }: { tile: LegacyTile }) {
  if (!tile.reminder) return null;

  const badgeText =
    tile.reminder.recurring === "daily"
      ? "Daily"
      : tile.reminder.recurring === "weekly"
        ? "Weekly"
        : tile.reminder.recurring === "monthly"
          ? "Monthly"
          : "Once";

  return <div className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">🔔 {badgeText}</div>;
}
