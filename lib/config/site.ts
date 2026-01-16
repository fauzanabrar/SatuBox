export const siteConfig = {
  productName: "Satubox",
  brandMark: "S",
  appKey: "satubox",
  description: "Share files fast, control access, and manage storage.",
  legalName: "Your Legal Business Name",
  supportEmail: "support@yourdomain.com",
  supportPhone: "+62 000-0000-0000",
  website: "https://yourdomain.com",
  address: "Your Business Address",
  supportHours: "Mon-Fri, 09:00-17:00 WIB",
  locale: "id-ID",
  currency: "IDR",
} as const;

export const footerLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const policyLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalHighlights = [
  {
    title: "Payments",
    description: "Payments are processed by Midtrans.",
  },
  {
    title: "Support",
    description: `Reach us at ${siteConfig.supportEmail}.`,
  },
  {
    title: "Policies",
    description: "Terms, privacy, and refund policy in one place.",
  },
] as const;
