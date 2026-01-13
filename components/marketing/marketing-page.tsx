import { ReactNode } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/marketing-header";
import MarketingFooter from "@/components/marketing/marketing-footer";
import { siteInfo } from "@/lib/marketing/site-info";

interface MarketingPageProps {
  title: string;
  description: string;
  isSignedIn: boolean;
  children: ReactNode;
}

export default function MarketingPage({
  title,
  description,
  isSignedIn,
  children,
}: MarketingPageProps) {
  const policyLinks = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  const highlights = [
    {
      title: "Payments",
      description: "Payments are processed by Midtrans.",
    },
    {
      title: "Support",
      description: `Reach us at ${siteInfo.supportEmail}.`,
    },
    {
      title: "Policies",
      description: "Terms, privacy, and refund policy in one place.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/40" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-muted/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <MarketingHeader isSignedIn={isSignedIn} />
        <div className="mx-auto w-full max-w-6xl px-6 pb-12 pt-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Legal and support
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-background/80 p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">{children}</div>
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Policy library
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link className="hover:text-foreground" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Need help?
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Email{" "}
                <a
                  className="text-foreground underline"
                  href={`mailto:${siteInfo.supportEmail}`}
                >
                  {siteInfo.supportEmail}
                </a>{" "}
                or call {siteInfo.supportPhone}.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Support hours: {siteInfo.supportHours}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Payments
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Payments are processed by Midtrans. Keep your order ID for
                verification or support.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
