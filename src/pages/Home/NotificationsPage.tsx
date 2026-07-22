import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Package, Trash2, ArrowLeftRight } from "lucide-react";
import { useToast } from "../../components/Toast";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../../hooks/useNotifications";
import type { Notification } from "../../services/notificationService";

const eventConfig: Record<string, { icon: typeof Package; color: string; bg: string }> = {
  ProductCreatedEvent: { icon: Package, color: "text-green-600", bg: "bg-green-100" },
  ProductDeletedEvent: { icon: Trash2, color: "text-red-600", bg: "bg-red-100" },
  SwapRequestedEvent: { icon: ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-100" },
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationsPage() {
  const { showToast } = useToast();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      showToast("All marked as read", "success");
    } catch {
      showToast("Failed to mark all as read", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-6 sm:pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl sm:text-3xl">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </motion.button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-lg font-medium">You're all caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No notifications to show</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n: Notification, i: number) => {
                const cfg = eventConfig[n.eventType] || eventConfig.ProductCreatedEvent;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                    className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${
                      n.isRead ? "bg-white" : "bg-purple-50/60 border border-purple-100"
                    } hover:shadow-sm`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{relativeTime(n.createdOn)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
