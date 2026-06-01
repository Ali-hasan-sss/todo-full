import { format } from "date-fns";
import { dateLocale } from "./date-locale";

/** Builds `datetime-local` value for a calendar day with default time (17:00). */
export function dayToDateTimeLocal(day: Date, hour = 17, minute = 0): string {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converts ISO string to `datetime-local` input value (local timezone). */
export function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parses `datetime-local` value to ISO string for API. */
export function fromDateTimeLocalValue(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Displays date and time in Arabic locale. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "d MMM yyyy، HH:mm", { locale: dateLocale });
}

/** Short display: time only if today, else date + time. */
export function formatDateTimeShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const isSameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isSameDay) {
    return format(d, "HH:mm", { locale: dateLocale });
  }
  return format(d, "d MMM، HH:mm", { locale: dateLocale });
}
