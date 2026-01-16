import Link from "next/link";
import { footerLinks, siteConfig } from "@/lib/config/site";

export default function MarketingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {siteConfig.productName}
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
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
          <p>{siteConfig.legalName}</p>
          <p>{siteConfig.address}</p>
          <p>
            Support:{" "}
            <a
              className="hover:text-foreground"
              href={`mailto:${siteConfig.supportEmail}`}
            >
              {siteConfig.supportEmail}
            </a>{" "}
            | {siteConfig.supportPhone}
          </p>
        </div>
      </div>
    </footer>
  );
}
