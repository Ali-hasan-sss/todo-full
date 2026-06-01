"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/notification.service";
import { useNotifications, NOTIFICATIONS_KEY } from "@/hooks/use-notifications";
import { useNotificationStore } from "@/store/notification.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ar, formatUnreadCount } from "@/lib/translations";
import { dateLocale } from "@/lib/date-locale";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

export function NotificationPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const { data, isLoading } = useNotifications({ refetchInterval: 10_000 });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      setUnreadCount(0);
      toast.success(ar.notifications.allMarkedRead);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.taskId) {
      router.push(`/board?taskId=${notification.taskId}`);
      return;
    }

    return;
  };

  const notifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{ar.notifications.title}</h2>
          <p className="text-sm text-muted-foreground">{formatUnreadCount(unreadCount)}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>
            <CheckCheck className="h-4 w-4 ms-2" />
            {ar.notifications.markAllRead}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-30" />
          <p>{ar.notifications.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNotificationClick(n);
                }
              }}
              className={cn(
                "flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50",
                !n.isRead && "bg-primary/5 border-primary/20",
                n.taskId && "hover:border-primary/40",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </p>
                {n.taskId && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {ar.notifications.clickToOpen}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={ar.notifications.markAllRead}
                    onClick={() => markReadMutation.mutate(n.id)}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(n.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
