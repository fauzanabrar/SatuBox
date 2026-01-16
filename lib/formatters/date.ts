import { siteConfig } from "@/lib/config/site";

type TimestampLike = { toDate?: () => Date; seconds?: number };

const resolveDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object") {
    const asAny = value as TimestampLike;
    if (typeof asAny.toDate === "function") {
      return asAny.toDate();
    }
    if (typeof asAny.seconds === "number") {
      return new Date(asAny.seconds * 1000);
    }
  }
  return null;
};

export const formatDateTime = (
  value: unknown,
  options: Intl.DateTimeFormatOptions = {},
) => {
  const date = resolveDate(value);
  if (!date) return "Unknown";

  return date.toLocaleDateString(siteConfig.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatDate = (
  value: unknown,
  options: Intl.DateTimeFormatOptions = {},
) => {
  const date = resolveDate(value);
  if (!date) return "Unknown";

  return date.toLocaleDateString(siteConfig.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};
