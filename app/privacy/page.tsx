import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/marketing-page";
import MarketingSection from "@/components/marketing/marketing-section";
import { getUserSession } from "@/lib/next-auth/user-session";
import { siteInfo } from "@/lib/marketing/site-info";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Satubox collects, uses, and protects personal data.",
};

export default async function PrivacyPage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  return (
    <MarketingPage
      title="Privacy Policy"
      description="We collect only what we need to operate the service and process payments securely."
      isSignedIn={isSignedIn}
    >
      <MarketingSection title="1. Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>Account data such as name, email, and authentication details.</li>
          <li>Files and metadata you upload or share through the service.</li>
          <li>
            Billing details required to process payments, handled by Midtrans.
          </li>
          <li>Usage data like device, browser, and activity logs.</li>
        </ul>
      </MarketingSection>
      <MarketingSection title="2. How we use information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide storage, sharing, and download features.</li>
          <li>Process subscriptions and paid downloads.</li>
          <li>Improve performance, security, and customer support.</li>
          <li>Send service-related notices and updates.</li>
        </ul>
      </MarketingSection>
      <MarketingSection title="3. Sharing of information">
        <p>
          We share data only with trusted providers who help run the service,
          such as payment processors, hosting, and analytics. We do not sell
          personal data.
        </p>
      </MarketingSection>
      <MarketingSection title="4. Cookies and analytics">
        <p>
          We use cookies and similar technologies to keep you signed in and to
          measure performance. You can control cookies in your browser settings.
        </p>
      </MarketingSection>
      <MarketingSection title="5. Data retention">
        <p>
          We keep personal data for as long as needed to provide the service and
          meet legal obligations. You can request deletion of your account and
          files by contacting support.
        </p>
      </MarketingSection>
      <MarketingSection title="6. Security">
        <p>
          We apply reasonable technical and organizational measures to protect
          your data. No method of transmission or storage is fully secure, so we
          cannot guarantee absolute security.
        </p>
      </MarketingSection>
      <MarketingSection title="7. Your rights">
        <p>
          You may access, correct, or delete your personal data by contacting{" "}
          <a className="text-foreground underline" href={`mailto:${siteInfo.supportEmail}`}>
            {siteInfo.supportEmail}
          </a>
          .
        </p>
      </MarketingSection>
      <MarketingSection title="8. Contact">
        <p>
          Privacy questions can be sent to{" "}
          <a className="text-foreground underline" href={`mailto:${siteInfo.supportEmail}`}>
            {siteInfo.supportEmail}
          </a>
          .
        </p>
      </MarketingSection>
    </MarketingPage>
  );
}
