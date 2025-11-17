import { Bell, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { formatDateTime } from "@/lib/dateUtils";

const notificationTypeColors = {
  info: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  success: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  warning: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  error: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

const notificationTypeIcons = {
  info: "ℹ️",
  success: "✓",
  warning: "⚠️",
  error: "✕",
};

export function NotificationCenter() {
  const { notifications, clearNotifications, markNotificationAsRead } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative" title="Notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-96 overflow-y-auto">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Notifications</DialogTitle>
          {notifications.length > 0 && (
            <Button
              onClick={clearNotifications}
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notificationTypeColors[notification.type]
                } ${notification.read ? "opacity-60" : "opacity-100"}`}
                style={{
                  borderLeftColor:
                    notification.type === "error"
                      ? "#ef4444"
                      : notification.type === "warning"
                        ? "#f59e0b"
                        : notification.type === "success"
                          ? "#10b981"
                          : "#3b82f6",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {notificationTypeIcons[notification.type]}
                      </span>
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDateTime(notification.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
