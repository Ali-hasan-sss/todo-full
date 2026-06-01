"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { authService } from "@/services/auth.service";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    authService
      .me()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        router.replace("/login");
      });
  }, [isAuthenticated, router, setUser]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const syncSidebar = () => {
      setSidebarOpen(media.matches);
    };

    syncSidebar();
    media.addEventListener("change", syncSidebar);
    return () => media.removeEventListener("change", syncSidebar);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      <NotificationListener />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
