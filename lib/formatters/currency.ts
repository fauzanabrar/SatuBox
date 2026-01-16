import { siteConfig } from "@/lib/config/site";

type CurrencyOptions = {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export const formatCurrency = (
  value?: number | null,
  options: CurrencyOptions = {},
) => {
  const amount =
    typeof value === "number" && Number.isFinite(value) ? value : 0;
  const locale = options.locale ?? siteConfig.locale;
  const currency = options.currency ?? siteConfig.currency;
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options.maximumFractionDigits ?? 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};
