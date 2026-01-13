import Link from "next/link";
import { siteInfo } from "@/lib/marketing/site-info";

const footerLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {siteInfo.productName}
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Secure file sharing, storage, and paid downloads.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-1 text-xs text-muted-foreground">
          <p>{siteInfo.legalName}</p>
          <p>{siteInfo.address}</p>
          <p>
            Support:{" "}
            <a
              className="hover:text-foreground"
              href={`mailto:${siteInfo.supportEmail}`}
            >
              {siteInfo.supportEmail}
            </a>{" "}
            | {siteInfo.supportPhone}
          </p>
        </div>
      </div>
    </footer>
  );
}
