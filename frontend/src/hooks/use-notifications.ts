import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications(options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const res = await notificationService.list({ limit: 50 });
      return res.data;
    },
    refetchInterval: options?.refetchInterval ?? 5_000,
    refetchIntervalInBackground: true,
    enabled: options?.enabled ?? true,
  });
}

export { NOTIFICATIONS_KEY };
