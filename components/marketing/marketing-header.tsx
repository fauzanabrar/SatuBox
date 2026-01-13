import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteInfo } from "@/lib/marketing/site-info";

interface MarketingHeaderProps {
  isSignedIn?: boolean;
}

export default function MarketingHeader({
  isSignedIn = false,
}: MarketingHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        {siteInfo.productName}
      </Link>
      <div className="flex items-center gap-3">
        <Link href={isSignedIn ? "/list" : "/login"} className="link-ghost">
          {isSignedIn ? "Open app" : "Login"}
        </Link>
        {!isSignedIn && (
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
