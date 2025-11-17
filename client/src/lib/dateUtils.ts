/**
 * Date and reminder utilities for tile management
 */

export interface DateInfo {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean; // Within 3 days
  daysUntil: number;
  label: string;
  color: "default" | "warning" | "error" | "success";
}

/**
 * Parse ISO date string and return human-readable info
 */
export function getDateInfo(dateString?: string): DateInfo | null {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);

  const timeDiff = dueDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const isOverdue = daysUntil < 0;
  const isDueToday = daysUntil === 0;
  const isDueSoon = daysUntil > 0 && daysUntil <= 3;

  let label = "";
  let color: "default" | "warning" | "error" | "success" = "default";

  if (isOverdue) {
    const daysOverdue = Math.abs(daysUntil);
    label = `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}`;
    color = "error";
  } else if (isDueToday) {
    label = "Due today";
    color = "warning";
  } else if (isDueSoon) {
    label = `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
    color = "warning";
  } else {
    label = formatDate(dueDate);
    color = "default";
  }

  return {
    isOverdue,
    isDueToday,
    isDueSoon,
    daysUntil,
    label,
    color,
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: new Date().getFullYear() === date.getFullYear() ? undefined : "numeric",
  };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format date with time (for detailed display)
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Get next reminder date based on recurring pattern
 */
export function getNextReminderDate(baseDate: string, recurring?: string): string {
  const date = new Date(baseDate);

  switch (recurring) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date.toISOString();
}

/**
 * Convert date object to ISO string (YYYY-MM-DD)
 */
export function dateToISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get a date range for filtering
 */
export function getDateRange(type: "today" | "week" | "month" | "overdue") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = dateToISO(today);

  let startDate = todayISO;
  let endDate = todayISO;

  switch (type) {
    case "today":
      endDate = todayISO;
      break;
    case "week":
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      endDate = dateToISO(weekEnd);
      break;
    case "month":
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      endDate = dateToISO(monthEnd);
      break;
    case "overdue":
      const far = new Date(1970, 0, 1);
      startDate = dateToISO(far);
      endDate = dateToISO(new Date(today.getTime() - 1));
      break;
  }

  return { startDate, endDate };
}
