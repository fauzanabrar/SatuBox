import type { Metadata } from "next";
import Link from "next/link";
import MarketingPage from "@/components/marketing/marketing-page";
import MarketingSection from "@/components/marketing/marketing-section";
import { getUserSession } from "@/lib/next-auth/user-session";
import { siteInfo } from "@/lib/marketing/site-info";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of the Satubox platform.",
};

export default async function TermsPage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  return (
    <MarketingPage
      title="Terms of Service"
      description="These terms explain how the service works, what is allowed, and how billing is handled."
      isSignedIn={isSignedIn}
    >
      <MarketingSection title="1. Agreement to these terms">
        <p>
          By accessing or using {siteInfo.productName}, you agree to these Terms
          of Service and our{" "}
          <Link className="text-foreground underline" href="/privacy">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the service.
        </p>
      </MarketingSection>
      <MarketingSection title="2. Accounts and eligibility">
        <p>
          You must provide accurate information, keep your credentials secure,
          and promptly notify us of unauthorized access. You are responsible for
          activity that occurs under your account.
        </p>
      </MarketingSection>
      <MarketingSection title="3. Subscriptions and billing">
        <p>
          Paid plans renew automatically unless canceled. Prices are listed in
          the billing page and may include applicable taxes. For details on
          cancellations and refunds, see our{" "}
          <Link className="text-foreground underline" href="/refund-policy">
            Refund Policy
          </Link>
          .
        </p>
      </MarketingSection>
      <MarketingSection title="4. Paid downloads">
        <p>
          If you enable paid downloads, you are responsible for the content,
          pricing, and fulfillment of your files. We process payments via
          Midtrans and may deduct processing fees as applicable.
        </p>
      </MarketingSection>
      <MarketingSection title="5. Content ownership and license">
        <p>
          You retain ownership of your files. By uploading content, you grant us
          a limited license to host, store, and display the content for the
          purpose of providing the service.
        </p>
      </MarketingSection>
      <MarketingSection title="6. Acceptable use">
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not upload unlawful, infringing, or harmful content.</li>
          <li>Do not distribute malware or attempt to disrupt the service.</li>
          <li>Do not abuse public links or access controls.</li>
        </ul>
      </MarketingSection>
      <MarketingSection title="7. Third-party services">
        <p>
          Payments are handled by Midtrans. Their terms and privacy practices
          also apply to payment transactions.
        </p>
      </MarketingSection>
      <MarketingSection title="8. Termination">
        <p>
          We may suspend or terminate access if you violate these terms or if
          required to protect the service or other users.
        </p>
      </MarketingSection>
      <MarketingSection title="9. Disclaimers and limitation of liability">
        <p>
          The service is provided on an as-is basis. To the maximum extent
          permitted by law, {siteInfo.legalName} is not liable for indirect,
          incidental, or consequential damages arising from use of the service.
        </p>
      </MarketingSection>
      <MarketingSection title="10. Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a className="text-foreground underline" href={`mailto:${siteInfo.supportEmail}`}>
            {siteInfo.supportEmail}
          </a>
          .
        </p>
      </MarketingSection>
    </MarketingPage>
  );
}
