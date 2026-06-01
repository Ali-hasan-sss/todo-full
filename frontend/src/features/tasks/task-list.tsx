"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isPast } from "date-fns";
import { formatDateTime } from "@/lib/datetime";
import { Search, Plus, Copy, Archive, Check } from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/services/task.service";
import { TaskDialog } from "./task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/store/ui.store";
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { ar, formatTaskCount } from "@/lib/translations";
import { cn } from "@/lib/utils";
import type { Priority, TaskStatus } from "@/types";

interface TaskListProps {
  archived?: boolean;
}

export function TaskList({ archived = false }: TaskListProps) {
  const queryClient = useQueryClient();
  const { openTaskDialog } = useUIStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", { search, statusFilter, priorityFilter, archived }],
    queryFn: async () => {
      const res = await taskService.list({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        isArchived: archived,
      });
      return res.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(ar.tasks.taskCompleted);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => taskService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(ar.tasks.taskDuplicated);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      archived ? taskService.restore(id) : taskService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(archived ? ar.tasks.taskRestored : ar.tasks.taskArchived);
    },
  });

  const tasks = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold">{archived ? ar.tasks.archive : ar.tasks.title}</h2>
          <p className="text-sm text-muted-foreground">{formatTaskCount(total)}</p>
        </div>
        {!archived && (
          <Button onClick={() => openTaskDialog()}>
            <Plus className="h-4 w-4 ms-2" />
            {ar.tasks.newTask}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 p-6 pb-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={ar.tasks.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
        >
          <option value="">{ar.tasks.allStatus}</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "")}
        >
          <option value="">{ar.tasks.allPriority}</option>
          {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{ar.tasks.noTasks}</p>
          </div>
        ) : (
          tasks.map((task) => {
            const overdue =
              task.dueDate && task.status !== "DONE" && isPast(new Date(task.dueDate));
            return (
              <div
                key={task.id}
                className="group flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => openTaskDialog(task)}
              >
                {!archived && task.status !== "DONE" && (
                  <button
                    className="shrink-0 rounded-full border-2 p-0.5 hover:border-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeMutation.mutate(task.id);
                    }}
                  >
                    <Check className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                  </button>
                )}
                {task.colorLabel && (
                  <span
                    className="h-8 w-1 rounded-full shrink-0"
                    style={{ backgroundColor: task.colorLabel }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium",
                      task.status === "DONE" && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  )}
                </div>
                <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
                {task.dueDate && (
                  <span
                    className={cn("text-xs shrink-0", overdue && "text-destructive font-medium")}
                    title={ar.tasks.dueDate}
                  >
                    {formatDateTime(task.dueDate)}
                  </span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateMutation.mutate(task.id);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveMutation.mutate(task.id);
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TaskDialog />
    </>
  );
}
