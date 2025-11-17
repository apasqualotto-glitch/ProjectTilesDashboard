/**
 * Notification system utilities
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  tileId?: string;
  read: boolean;
}

/**
 * Create a notification object
 */
export function createNotification(
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  tileId?: string
): AppNotification {
  return {
    id: `notif-${Date.now()}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    tileId,
    read: false,
  };
}

/**
 * Check if browser supports notifications
 */
export function notificationsSupported(): boolean {
  return "Notification" in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Send a browser notification
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!notificationsSupported() || Notification.permission !== "granted") {
    return null;
  }

  return new Notification(title, {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    ...options,
  });
}

/**
 * Send notification for overdue/due soon tiles
 */
export function sendReminderNotification(tileTitle: string, status: "overdue" | "due-soon" | "due-today"): void {
  const messages = {
    overdue: `📌 ${tileTitle} is overdue!`,
    "due-soon": `⏰ ${tileTitle} is due soon`,
    "due-today": `⏰ ${tileTitle} is due today`,
  };

  sendBrowserNotification(messages[status], {
    tag: `reminder-${tileTitle}`,
    requireInteraction: status === "overdue",
  });
}

/**
 * Store notifications in localStorage
 */
export function storeNotification(notification: AppNotification): void {
  const key = "app_notifications";
  const existing = JSON.parse(localStorage.getItem(key) || "[]") as AppNotification[];
  existing.push(notification);

  // Keep only last 50 notifications
  const trimmed = existing.slice(-50);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

/**
 * Get stored notifications
 */
export function getStoredNotifications(): AppNotification[] {
  const key = "app_notifications";
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as AppNotification[];
  } catch {
    return [];
  }
}

/**
 * Clear all stored notifications
 */
export function clearNotifications(): void {
  localStorage.setItem("app_notifications", "[]");
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  const key = "app_notifications";
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  localStorage.setItem(key, JSON.stringify(updated));
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  return getStoredNotifications().filter((n) => !n.read).length;
}
