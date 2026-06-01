"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";
import { useNotificationStore } from "@/store/notification.store";
import { useAuthStore } from "@/store/auth.store";
import { ar } from "@/lib/translations";
import type { Notification } from "@/types";

function showBrowserNotification(notification: Notification): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const browserNotif = new window.Notification(notification.title, {
    body: notification.message,
    tag: notification.id,
    icon: "/favicon.ico",
  });

  browserNotif.onclick = () => {
    window.focus();
    if (notification.taskId) {
      window.location.href = `/board?taskId=${notification.taskId}`;
    } else {
      window.location.href = "/notifications";
    }
    browserNotif.close();
  };
}

function showInAppToast(notification: Notification): void {
  toast(notification.title, {
    description: notification.message,
    duration: 6000,
    action: notification.taskId
      ? {
          label: ar.notifications.viewTask,
          onClick: () => {
            window.location.href = `/board?taskId=${notification.taskId}`;
          },
        }
      : undefined,
  });
}

export function NotificationListener() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const { data } = useNotifications({ enabled: isAuthenticated, refetchInterval: 5_000 });

  const initializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    const notifications = data.data ?? [];
    const unread = data.meta?.unreadCount ?? 0;
    setUnreadCount(unread);

    if (!initializedRef.current) {
      notifications.forEach((n) => seenIdsRef.current.add(n.id));
      initializedRef.current = true;
      return;
    }

    for (const notification of notifications) {
      if (seenIdsRef.current.has(notification.id)) continue;
      seenIdsRef.current.add(notification.id);

      if (!notification.isRead) {
        showInAppToast(notification);
        showBrowserNotification(notification);
      }
    }
  }, [data, setUnreadCount]);

  return null;
}
