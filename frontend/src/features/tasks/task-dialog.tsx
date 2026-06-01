"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { taskFormSchema, type TaskFormValues } from "@/validators/task.schema";
import { taskService } from "@/services/task.service";
import { useUIStore } from "@/store/ui.store";
import { COLOR_OPTIONS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { ar } from "@/lib/translations";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { Priority, TaskStatus } from "@/types";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const emptyDateTimes = {
  dueDate: null as string | null,
  reminderDate: null as string | null,
  expectedEndAt: null as string | null,
};

function toPayload(data: TaskFormValues) {
  return {
    ...data,
    dueDate: fromDateTimeLocalValue(data.dueDate),
    reminderDate: fromDateTimeLocalValue(data.reminderDate),
    expectedEndAt: fromDateTimeLocalValue(data.expectedEndAt),
  };
}

export function TaskDialog() {
  const queryClient = useQueryClient();
  const { taskDialogOpen, editingTask, newTaskDefaults, closeTaskDialog } = useUIStore();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      ...emptyDateTimes,
      colorLabel: COLOR_OPTIONS[0],
    },
  });

  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description ?? "",
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: toDateTimeLocalValue(editingTask.dueDate),
        reminderDate: toDateTimeLocalValue(editingTask.reminderDate),
        expectedEndAt: toDateTimeLocalValue(editingTask.expectedEndAt),
        colorLabel: editingTask.colorLabel ?? COLOR_OPTIONS[0],
      });
    } else {
      form.reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        ...emptyDateTimes,
        ...newTaskDefaults,
        colorLabel: COLOR_OPTIONS[0],
      });
    }
  }, [editingTask, newTaskDefaults, form]);

  const mutation = useMutation({
    mutationFn: (data: TaskFormValues) => {
      const payload = toPayload(data);
      return editingTask
        ? taskService.update(editingTask.id, payload)
        : taskService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "calendar"] });
      toast.success(editingTask ? ar.tasks.taskUpdated : ar.tasks.taskCreated);
      closeTaskDialog();
    },
    onError: () => toast.error(ar.tasks.saveFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.delete(editingTask!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      toast.success(ar.tasks.taskDeleted);
      closeTaskDialog();
    },
  });

  return (
    <Dialog open={taskDialogOpen} onOpenChange={(open) => !open && closeTaskDialog()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTask ? ar.tasks.editTask : ar.tasks.newTask}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{ar.tasks.taskTitle}</Label>
            <Input id="title" {...form.register("title")} placeholder={ar.tasks.taskTitle} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{ar.tasks.description}</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("description")}
              placeholder={ar.tasks.descriptionPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{ar.tasks.priority}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("priority")}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{ar.tasks.status}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("status")}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <p className="text-sm font-medium">{ar.tasks.dateTimeSection}</p>

            <div className="space-y-2">
              <Label htmlFor="expectedEndAt">{ar.tasks.expectedEndAt}</Label>
              <Input
                id="expectedEndAt"
                type="datetime-local"
                dir="ltr"
                className="text-end"
                {...form.register("expectedEndAt")}
              />
              <p className="text-xs text-muted-foreground">{ar.tasks.expectedEndAtHint}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">{ar.tasks.dueDate}</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                dir="ltr"
                className="text-end"
                {...form.register("dueDate")}
              />
              <p className="text-xs text-muted-foreground">{ar.tasks.dueDateHint}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderDate">{ar.tasks.reminder}</Label>
              <Input
                id="reminderDate"
                type="datetime-local"
                dir="ltr"
                className="text-end"
                {...form.register("reminderDate")}
              />
              <p className="text-xs text-muted-foreground">{ar.tasks.reminderHint}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{ar.tasks.color}</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded-full ring-offset-2 transition-all",
                    form.watch("colorLabel") === color && "ring-2 ring-primary",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue("colorLabel", color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            {editingTask && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {ar.tasks.delete}
              </Button>
            )}
            <div className="flex gap-2 ms-auto">
              <Button type="button" variant="outline" onClick={closeTaskDialog}>
                {ar.tasks.cancel}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? ar.tasks.saving : ar.tasks.save}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
