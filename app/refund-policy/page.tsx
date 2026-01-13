import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/marketing-page";
import MarketingSection from "@/components/marketing/marketing-section";
import { getUserSession } from "@/lib/next-auth/user-session";
import { siteInfo } from "@/lib/marketing/site-info";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How refunds and cancellations are handled for Satubox.",
};

export default async function RefundPolicyPage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  return (
    <MarketingPage
      title="Refund Policy"
      description="This policy covers subscriptions, paid downloads, and how to request a refund."
      isSignedIn={isSignedIn}
    >
      <MarketingSection title="1. Subscription cancellations">
        <p>
          You can cancel a paid plan at any time from the billing page. Your
          plan remains active until the end of the current billing period.
        </p>
      </MarketingSection>
      <MarketingSection title="2. Subscription refunds">
        <p>
          We do not provide prorated refunds for unused time, except where
          required by law. If you believe a charge is incorrect, contact support
          within 7 days of the transaction.
        </p>
      </MarketingSection>
      <MarketingSection title="3. Paid downloads">
        <p>
          Paid downloads are digital goods delivered immediately. Refunds are
          generally not available once a file has been delivered, unless the
          file is materially defective or you were charged in error.
        </p>
      </MarketingSection>
      <MarketingSection title="4. How to request a refund">
        <p>
          Contact{" "}
          <a className="text-foreground underline" href={`mailto:${siteInfo.supportEmail}`}>
            {siteInfo.supportEmail}
          </a>{" "}
          with your account email, order ID, and a brief description of the
          issue. We typically respond within 2 business days.
        </p>
      </MarketingSection>
      <MarketingSection title="5. Chargebacks">
        <p>
          Please contact support before initiating a chargeback so we can help
          resolve the issue quickly.
        </p>
      </MarketingSection>
    </MarketingPage>
  );
}
