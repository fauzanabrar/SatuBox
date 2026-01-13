import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getUserSession } from "@/lib/next-auth/user-session";
import { PLAN_ORDER, PLANS } from "@/lib/billing/plans";
import MarketingHeader from "@/components/marketing/marketing-header";
import MarketingFooter from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "Storage + sharing",
  description:
    "Share files fast, control access, and manage storage in one place.",
};

export default async function HomePage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

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
              Storage + sharing
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Share files fast, keep access tidy, and manage everything in one
                place.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Satubox keeps uploads organized with folders, instant previews,
                and share links that feel effortless. Upgrade for more storage
                and ad-free downloads.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={isSignedIn ? "/list" : "/register"}>
                  {isSignedIn ? "Go to dashboard" : "Start free"}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Explore demo</Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/80 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Share
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  Public links
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Access
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  Permissioned folders
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Monetize
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  Paid downloads
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Your workspace
                  </p>
                  <h2 className="text-lg font-semibold">Satubox Library</h2>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  12 items
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border bg-background/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                      ZIP
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Brand kit.zip
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Public link
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">240 MB</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-background/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                      DIR
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Campaign assets
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shared with 3 people
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">3.1 GB</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-background/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-foreground">
                      MP4
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Launch demo.mp4
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Paid download
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">820 MB</span>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Storage used</span>
                  <span>4.2 GB / 5 GB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[85%] rounded-full bg-primary" />
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
                Payments are processed securely via Midtrans.
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Fast sharing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate share links with preview, download, and file size in one
              click.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Permissioned folders</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Each user gets a private root folder and can grant access to
              collaborators.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Monetize downloads</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Free tier shows ads (coming soon). Paid members enjoy ad-free
              links.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pricing built for scale
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly or annual billing. Upgrade anytime.
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              return (
                <div
                  key={plan.id}
                  className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {plan.storageLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="space-y-1 text-sm">
                      {planId === "free" ? (
                        <p className="text-2xl font-semibold">Free</p>
                      ) : (
                        <>
                          <p className="text-2xl font-semibold">
                            Rp {plan.monthlyPrice.toLocaleString("id-ID")}/mo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Or Rp {plan.annualPrice.toLocaleString("id-ID")}/yr
                          </p>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Public share links</li>
                      <li>
                        {plan.adFree
                          ? "Ad-free downloads"
                          : "Downloads show ads"}
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
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to share smarter?
        </h2>
        <p className="text-sm text-muted-foreground">
          Start free, then upgrade when you need more storage.
        </p>
        <Button asChild>
          <Link href={isSignedIn ? "/list" : "/register"}>
            {isSignedIn ? "Open dashboard" : "Create your account"}
          </Link>
        </Button>
      </section>
      <MarketingFooter />
    </div>
  );
}
