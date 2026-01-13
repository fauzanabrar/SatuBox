import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/marketing-page";
import MarketingSection from "@/components/marketing/marketing-section";
import { getUserSession } from "@/lib/next-auth/user-session";
import { siteInfo } from "@/lib/marketing/site-info";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Satubox support and business contacts.",
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
              <a className="text-foreground underline" href={`mailto:${siteInfo.supportEmail}`}>
                {siteInfo.supportEmail}
              </a>
            </li>
            <li>Phone: {siteInfo.supportPhone}</li>
            <li>Hours: {siteInfo.supportHours}</li>
          </ul>
        </MarketingSection>
        <MarketingSection title="Business information" className="h-full">
          <ul className="list-disc space-y-2 pl-5">
            <li>Legal name: {siteInfo.legalName}</li>
            <li>Address: {siteInfo.address}</li>
            <li>Website: {siteInfo.website}</li>
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
