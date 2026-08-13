import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Package, Trash2, Heart } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import type { Notification } from '../../services/notificationService';

const eventConfig: Record<string, { icon: typeof Package; color: string }> = {
  ProductCreatedEvent: { icon: Package, color: 'var(--color-nearby-blue)' },
  ProductDeletedEvent: { icon: Trash2,  color: 'var(--color-nearby-coral)' },
  SwapRequestedEvent:  { icon: Heart,   color: 'var(--color-nearby-yellow)' },
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
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

  const handleMarkAll = async () => {
    try { await markAllAsRead.mutateAsync(); showToast('All marked as read', 'success'); }
    catch { showToast('Failed to mark all as read', 'error'); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-5 pt-8" style={{ background: 'var(--color-nearby-bg)' }}>
        <div className="mx-auto max-w-2xl space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-[24px]" style={{ background: 'var(--color-nearby-surface)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 pt-8" style={{ background: 'var(--color-nearby-bg)' }}>
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className="rounded-full px-2.5 py-0.5 font-display text-xs font-semibold text-white"
                style={{ background: 'var(--color-nearby-coral)' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleMarkAll}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-sm font-medium transition-colors disabled:opacity-50"
              style={{ color: 'var(--color-nearby-dim)' }}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Empty */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl"
              style={{ background: 'var(--color-nearby-surface)' }}
            >
              <Bell className="h-7 w-7" style={{ color: 'var(--color-nearby-dim)' }} />
            </div>
            <p className="font-display text-lg font-bold" style={{ color: 'var(--color-nearby-text)' }}>
              You're all caught up!
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
              No notifications to show
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n: Notification, i: number) => {
                const cfg = eventConfig[n.eventType] ?? eventConfig.ProductCreatedEvent;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                    className="flex cursor-pointer items-start gap-3 rounded-[24px] p-4 ring-1 transition-all"
                    style={{
                      background: n.isRead ? 'var(--color-nearby-surface)' : 'var(--color-nearby-surface-2)',
                      ringColor: n.isRead ? 'rgba(255,255,255,0.05)' : `rgba(255,90,95,0.15)`,
                    }}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`, color: cfg.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm font-semibold truncate" style={{ color: 'var(--color-nearby-text)' }}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: 'var(--color-nearby-coral)' }} />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm line-clamp-2" style={{ color: 'var(--color-nearby-dim)' }}>{n.message}</p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>{relativeTime(n.createdOn)}</p>
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
