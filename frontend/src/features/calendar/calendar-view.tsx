"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { taskService } from "@/services/task.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarAddTaskButton } from "@/features/calendar/calendar-add-task-button";
import { useUIStore } from "@/store/ui.store";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { ar } from "@/lib/translations";
import { dateLocale } from "@/lib/date-locale";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

type ViewMode = "month" | "week" | "day";

const VIEW_LABELS: Record<ViewMode, string> = {
  month: ar.calendar.month,
  week: ar.calendar.week,
  day: ar.calendar.day,
};

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const { openTaskDialog } = useUIStore();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", "calendar"],
    queryFn: async () => {
      const res = await taskService.list({ limit: 100 });
      return res.data.data;
    },
  });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks?.forEach((task) => {
      if (task.dueDate) {
        const key = format(new Date(task.dueDate), "yyyy-MM-dd");
        const existing = map.get(key) ?? [];
        map.set(key, [...existing, task]);
      }
    });
    return map;
  }, [tasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: dateLocale });
  const calendarEnd = endOfWeek(monthEnd, { locale: dateLocale });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: dateLocale }),
    end: endOfWeek(currentDate, { locale: dateLocale }),
  });

  const currentDayKey = format(currentDate, "yyyy-MM-dd");
  const dayViewTasks = tasksByDate.get(currentDayKey) ?? [];

  if (isLoading) {
    return <Skeleton className="m-3 sm:m-6 h-80 sm:h-96 rounded-xl" />;
  }

  return (
    <div className="space-y-4 p-3 sm:p-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{ar.calendar.title}</h2>
          <p className="text-sm text-muted-foreground">
            {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-1 rounded-lg border p-1 sm:inline-flex sm:gap-0">
            {(["month", "week", "day"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm",
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground",
                )}
              >
                {VIEW_LABELS[mode]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              aria-label="الشهر السابق"
            >
              <ChevronRight className="h-4 w-4 rtl-flip" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setCurrentDate(new Date())}
            >
              {ar.calendar.today}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              aria-label="الشهر التالي"
            >
              <ChevronLeft className="h-4 w-4 rtl-flip" />
            </Button>
          </div>
        </div>
      </div>

      {/* Month view — horizontal scroll on small screens */}
      {viewMode === "month" && (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[560px] sm:min-w-0">
              <div className="grid grid-cols-7 border-b bg-muted/50">
                {ar.calendar.weekdays.map((d) => (
                  <div
                    key={d}
                    className="p-1.5 text-center text-[10px] font-medium text-muted-foreground sm:p-2 sm:text-xs"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayTasks = tasksByDate.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      className={cn(
                        "group relative min-h-[72px] border-b border-e p-1 transition-colors hover:bg-muted/40 sm:min-h-[100px] sm:p-2 lg:min-h-[108px]",
                        !isSameMonth(day, currentDate) && "bg-muted/20 text-muted-foreground",
                        isToday(day) && "bg-primary/5",
                      )}
                    >
                      <div className="mb-0.5 flex items-start justify-between gap-0.5 sm:mb-1 sm:gap-1">
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] sm:h-6 sm:w-6 sm:text-xs",
                            isToday(day) && "bg-primary font-bold text-primary-foreground",
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        <CalendarAddTaskButton date={day} size="sm" />
                      </div>
                      <div className="space-y-0.5 pe-0.5 sm:space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => openTaskDialog(task)}
                            className="w-full truncate rounded px-0.5 py-0.5 text-end text-[9px] font-medium hover:opacity-80 sm:px-1 sm:text-[10px]"
                            style={{
                              backgroundColor: `${task.colorLabel ?? "#6366f1"}20`,
                              color: task.colorLabel ?? "#6366f1",
                            }}
                          >
                            {task.title}
                          </button>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                            +{dayTasks.length - 2} {ar.calendar.more}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="px-2 py-1.5 text-center text-[10px] text-muted-foreground sm:hidden">
            اسحب لليمين لعرض كامل الشهر
          </p>
        </div>
      )}

      {/* Week view — stacked on mobile */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 lg:gap-2">
          {weekDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(key) ?? [];
            return (
              <div
                key={key}
                className={cn(
                  "group flex min-h-[120px] flex-col rounded-xl border p-3 sm:min-h-[140px]",
                  isToday(day) && "border-primary ring-1 ring-primary/30",
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold">
                    {format(day, "EEE d", { locale: dateLocale })}
                  </p>
                  <CalendarAddTaskButton date={day} size="sm" />
                </div>
                <div className="flex-1 space-y-2">
                  {dayTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{ar.calendar.noTasksDay}</p>
                  ) : (
                    dayTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => openTaskDialog(task)}
                        className="w-full rounded-lg border p-2 text-end text-xs hover:bg-muted/50"
                      >
                        <p className="truncate font-medium">{task.title}</p>
                        <Badge
                          className={cn("mt-1 text-[9px]", PRIORITY_COLORS[task.priority])}
                          variant="outline"
                        >
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day view */}
      {viewMode === "day" && (
        <div className="rounded-xl border p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold sm:text-lg">
            {format(currentDate, "EEEE، d MMMM", { locale: dateLocale })}
          </h3>

          {dayViewTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{ar.calendar.noTasksDay}</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {dayViewTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => openTaskDialog(task)}
                  className="flex w-full flex-col items-stretch gap-2 rounded-lg border p-3 text-start hover:bg-muted/50 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <span className="font-medium">{task.title}</span>
                  <Badge
                    className={cn("w-fit", PRIORITY_COLORS[task.priority])}
                    variant="outline"
                  >
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center border-t border-dashed pt-6">
            <CalendarAddTaskButton date={currentDate} alwaysVisible size="lg" />
          </div>
        </div>
      )}
    </div>
  );
}
