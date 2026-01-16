import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getUserSession } from "@/lib/next-auth/user-session";
import { PLAN_ORDER, PLANS } from "@/lib/billing/plans";
import MarketingHeader from "@/components/marketing/marketing-header";
import MarketingFooter from "@/components/marketing/marketing-footer";
import { marketingContent } from "@/lib/config/marketing";
import { siteConfig } from "@/lib/config/site";
import { formatCurrency } from "@/lib/formatters/currency";

export const metadata: Metadata = {
  title: `${siteConfig.productName} marketing template`,
  description: siteConfig.description,
};

export default async function HomePage() {
  const { hero, heroPreview, highlightCards, featureGrid, ctaSection } =
    marketingContent;
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  const storageProgress = Math.min(
    (heroPreview.storage.used / heroPreview.storage.limit) * 100,
    100,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/40" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-muted/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <MarketingHeader isSignedIn={isSignedIn} />
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {hero.tagLabel}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {hero.title}
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                {hero.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={isSignedIn ? "/list" : "/register"}>
                  {isSignedIn ? "Go to dashboard" : hero.primaryActionLabel}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">{hero.secondaryActionLabel}</Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {hero.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border bg-background/80 px-4 py-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {heroPreview.badge}
                  </p>
                  <h2 className="text-lg font-semibold">{heroPreview.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {heroPreview.subtitle}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Sample
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                {heroPreview.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border bg-background/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                        {item.symbol}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.size}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Storage used</span>
                  <span>
                    {heroPreview.storage.used.toFixed(1)} {heroPreview.storage.unit} /{" "}
                    {heroPreview.storage.limit} {heroPreview.storage.unit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${storageProgress}%` }}
                  />
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
                {heroPreview.note}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {highlightCards.map((card) => (
            <div key={card.title} className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {card.label}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Section-ready layout for any product
            </h2>
            <p className="text-sm text-muted-foreground">
              Keep or remove the sections below to match your roadmap. This layout keeps responsiveness and developer ergonomics intact.
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {featureGrid.map((feature) => (
              <div
                key={feature.title}
                className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-1 flex-col gap-3">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pricing built for scale
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly or annual billing. Upgrade anytime and adjust pricing to match your roadmap.
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              return (
                <div
                  key={plan.id}
                  className="flex h-full flex-col rounded-2xl border bg-background/90 p-6 shadow-sm"
                >
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {plan.storageLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="space-y-1 text-sm">
                      {planId === "free" ? (
                        <p className="text-2xl font-semibold">Free</p>
                      ) : (
                        <>
                          <p className="text-2xl font-semibold">
                            {formatCurrency(plan.monthlyPrice)}/mo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Or {formatCurrency(plan.annualPrice)}/yr
                          </p>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Public share links</li>
                      <li>
                        {plan.adFree ? "Ad-free downloads" : "Downloads show ads"}
                      </li>
                      <li>{plan.storageLabel} storage</li>
                    </ul>
                  </div>
                  <div className="mt-auto pt-6">
                    <Button
                      className="w-full"
                      variant={planId === "free" ? "outline" : "default"}
                      asChild
                    >
                      <Link href={isSignedIn ? "/billing" : "/register"}>
                        {planId === "free" ? "Start free" : "Upgrade"}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{ctaSection.title}</h2>
        <p className="text-sm text-muted-foreground">{ctaSection.description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={isSignedIn ? "/list" : "/register"}>
              {isSignedIn ? "Open dashboard" : ctaSection.primary}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">{ctaSection.secondary}</Link>
          </Button>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
