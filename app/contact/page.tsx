import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/marketing-page";
import MarketingSection from "@/components/marketing/marketing-section";
import { getUserSession } from "@/lib/next-auth/user-session";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${siteConfig.productName} support and business contacts.`,
};

export default async function ContactPage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  return (
    <MarketingPage
      title="Contact"
      description="Use the details below for support, billing, and business inquiries."
      isSignedIn={isSignedIn}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <MarketingSection title="Support" className="h-full">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Email:{" "}
              <a className="text-foreground underline" href={`mailto:${siteConfig.supportEmail}`}>
                {siteConfig.supportEmail}
              </a>
            </li>
            <li>Phone: {siteConfig.supportPhone}</li>
            <li>Hours: {siteConfig.supportHours}</li>
          </ul>
        </MarketingSection>
        <MarketingSection title="Business information" className="h-full">
          <ul className="list-disc space-y-2 pl-5">
            <li>Legal name: {siteConfig.legalName}</li>
            <li>Address: {siteConfig.address}</li>
            <li>Website: {siteConfig.website}</li>
          </ul>
        </MarketingSection>
      </div>
      <MarketingSection title="Billing questions">
        <p>
          Include your account email and order ID when contacting us about
          billing or Midtrans payments so we can help faster.
        </p>
      </MarketingSection>
    </MarketingPage>
  );
}
