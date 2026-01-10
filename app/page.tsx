import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserSession } from "@/lib/next-auth/user-session";
import { PLAN_ORDER, PLANS } from "@/lib/billing/plans";

export default async function HomePage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-lg font-semibold tracking-tight">
            Satubox
          </span>
          <div className="flex items-center gap-3">
            <Link
              href={isSignedIn ? "/list" : "/login"}
              className="link-ghost"
            >
              {isSignedIn ? "Open app" : "Login"}
            </Link>
            {!isSignedIn && (
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            )}
          </div>
        </header>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              New SaaS Storage
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Share files fast, control access, and stay ad-free when you
              upgrade.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Build a public share link in seconds. Keep your uploads organized
              with user folders, view media instantly, and scale storage as your
              library grows.
            </p>
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
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>Public share links</div>
              <div>Private folders</div>
              <div>Ad-free downloads for members</div>
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What you get</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Shareable preview pages for images and video.
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Per-user root folders with flexible permissions.
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Storage plans from 5 GB to 10 TB.
                </div>
              </div>
              <div className="rounded-2xl border border-dashed bg-slate-50 p-4 text-xs text-slate-500">
                Payments are mocked in-app for now. Connect a gateway later.
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Fast sharing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate share links with preview, download, and file size in one
              click.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Permissioned folders</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Each user gets a private root folder and can grant access to
              collaborators.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Monetize downloads</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Free tier shows ads (coming soon). Paid members enjoy ad-free
              links.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t bg-slate-50">
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
                  className="flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
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
    </div>
  );
}
