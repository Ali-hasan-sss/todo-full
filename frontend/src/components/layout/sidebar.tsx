"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  Calendar,
  Archive,
  Bell,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { useUIStore } from "@/store/ui.store";
import { authService } from "@/services/auth.service";

const navItems = [
  { href: "/dashboard", label: ar.nav.dashboard, icon: LayoutDashboard },
  { href: "/board", label: ar.nav.kanban, icon: Kanban },
  { href: "/tasks", label: ar.nav.tasks, icon: ListTodo },
  { href: "/calendar", label: ar.nav.calendar, icon: Calendar },
  { href: "/archive", label: ar.nav.archive, icon: Archive },
  { href: "/notifications", label: ar.nav.notifications, icon: Bell, showBadge: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { sidebarOpen, closeSidebar } = useUIStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      window.location.href = "/login";
    }
  };

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label={ar.nav.closeMenu}
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex h-full w-[min(100%,18rem)] flex-col border-e bg-card shadow-xl transition-transform duration-300 ease-in-out",
          "lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">{ar.app.name}</h1>
              <p className="truncate text-xs text-muted-foreground">{ar.app.tagline}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={closeSidebar}
            aria-label={ar.nav.closeMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            const badge =
              "showBadge" in item && item.showBadge && unreadCount > 0 ? unreadCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      active
                        ? "bg-primary-foreground text-primary"
                        : "bg-destructive text-destructive-foreground",
                    )}
                    aria-label={`${badge} ${ar.notifications.unread}`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-2">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 ms-2" />
            ) : (
              <Moon className="h-4 w-4 ms-2" />
            )}
            {ar.nav.toggleTheme}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 ms-2" />
            {ar.nav.logout}
          </Button>
        </div>
      </aside>
    </>
  );
}
