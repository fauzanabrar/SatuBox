import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/marketing-page";
import MarketingSection from "@/components/marketing/marketing-section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserSession } from "@/lib/next-auth/user-session";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about ${siteConfig.productName} billing and file sharing.`,
};

export default async function FaqPage() {
  const userSession = await getUserSession();
  const isSignedIn = Boolean(userSession?.username);

  const faqItems = [
    {
      id: "upgrade",
      question: "How do I upgrade or change my plan?",
      answer:
        "Go to the billing page in your dashboard and choose a new plan or billing cycle. Changes apply immediately after payment.",
    },
    {
      id: "paid-downloads",
      question: "How do paid downloads work?",
      answer:
        "You can set a price for a file or folder. Buyers pay through Midtrans and receive access as soon as payment is verified.",
    },
    {
      id: "cancel",
      question: "Can I cancel my subscription?",
      answer:
        "Yes. You can cancel anytime from the billing page. Your current plan stays active until the end of the billing period.",
    },
    {
      id: "uploads",
      question: "What files can I upload?",
      answer:
        "Most common file types are supported. Do not upload content that is illegal or violates intellectual property rights.",
    },
    {
      id: "support",
      question: "How do I contact support?",
      answer: (
        <>
          Email us at{" "}
          <a className="text-foreground underline" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
          .
        </>
      ),
    },
  ];

  return (
    <MarketingPage
      title="Frequently Asked Questions"
      description="Answers to common questions about storage, billing, and paid downloads."
      isSignedIn={isSignedIn}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <MarketingSection title="Still need help?">
        <p>
          Reach the team via{" "}
          <a className="text-foreground underline" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>{" "}
          or visit the{" "}
          <a className="text-foreground underline" href="/contact">
            contact page
          </a>
          .
        </p>
      </MarketingSection>
    </MarketingPage>
  );
}
