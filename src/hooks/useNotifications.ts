import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type Notification } from '../services/notificationService';

export const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications() {
  return useQuery<Notification[], Error, Notification[]>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30_000,
    select: (data) => data.slice(0, 50),
  });
}

export function useUnreadCount(): number {
  const { data } = useQuery<Notification[], Error, number>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30_000,
    select: (data) => data.filter((n) => !n.isRead).length,
  });
  return data ?? 0;
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const prev = qc.getQueryData(NOTIFICATIONS_KEY);
      qc.setQueryData(NOTIFICATIONS_KEY, (old: any[]) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(NOTIFICATIONS_KEY, ctx.prev);
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const prev = qc.getQueryData(NOTIFICATIONS_KEY);
      qc.setQueryData(NOTIFICATIONS_KEY, (old: any[]) =>
        old?.map((n) => ({ ...n, isRead: true }))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(NOTIFICATIONS_KEY, ctx.prev);
    },
  });
}
