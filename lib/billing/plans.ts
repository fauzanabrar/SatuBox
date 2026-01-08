export type PlanId = "free" | "starter" | "pro";
export type BillingCycle = "monthly" | "annual";

const gb = (value: number) => value * 1024 * 1024 * 1024;
const tb = (value: number) => value * 1024 * 1024 * 1024 * 1024;

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    description: "For personal sharing and lightweight storage.",
    storageLimitBytes: gb(5),
    storageLabel: "5 GB",
    monthlyPrice: 0,
    annualPrice: 0,
    adFree: false,
  },
  starter: {
    id: "starter",
    name: "Starter",
    description: "For creators who need more room and ad-free links.",
    storageLimitBytes: tb(1),
    storageLabel: "1 TB",
    monthlyPrice: 5,
    annualPrice: 50,
    adFree: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For teams managing large video libraries.",
    storageLimitBytes: tb(10),
    storageLabel: "10 TB",
    monthlyPrice: 10,
    annualPrice: 100,
    adFree: true,
  },
} as const;

export const DEFAULT_PLAN_ID: PlanId = "free";
export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro"];

export const formatBytes = (size?: number | null) => {
  if (size === null || size === undefined || Number.isNaN(size)) {
    return "Size unavailable";
  }
  if (size === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / Math.pow(1024, power);
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${
    units[power]
  }`;
};
