import { siteConfig } from "./site";

const heroStats = [
  { value: "2,400+", label: "Projects launched" },
  { value: "980+", label: "Teams trusting the layout" },
  { value: "99.9%", label: "Uptime ready for launch" },
];

export const marketingContent = {
  hero: {
    tagLabel: "Marketing template",
    title: `${siteConfig.productName} starter layout`,
    description:
      "Swap in copy, images, and links to align with your next idea. The sections on this page highlight benefits, pricing, and a strong call to action while keeping the layout flexible.",
    stats: heroStats,
    primaryActionLabel: "Start customizing",
    secondaryActionLabel: "View live demo",
  },
  heroPreview: {
    badge: "Workspace snapshot",
    title: "Campaign workspace",
    subtitle: "Replace this preview with a feature or dashboard visual.",
    items: [
      {
        symbol: "DOC",
        title: "Brand kit.zip",
        description: "Shared link ready",
        size: "240 MB",
      },
      {
        symbol: "DIR",
        title: "Campaign assets",
        description: "Shared with collaborators",
        size: "3.1 GB",
      },
      {
        symbol: "MP4",
        title: "Launch demo.mp4",
        description: "Feedback cycle",
        size: "820 MB",
      },
    ],
    storage: {
      used: 4.2,
      limit: 5,
      unit: "GB",
    },
    note: "Use this card to promote dashboards, adoption, or any key metric.",
  },
  highlightCards: [
    {
      label: "Structure",
      title: "Split hero + preview",
      description:
        "Keep the top section consistent while you swap in new visuals or onboarding copy.",
    },
    {
      label: "Messaging",
      title: "Feature highlights",
      description:
        "Bullet out your differentiators in repeatable cards that are easy to edit.",
    },
    {
      label: "Business ready",
      title: "Pricing & CTA",
      description:
        "Shipping a pricing grid and CTA lets you convert straight from the marketing page.",
    },
  ],
  featureGrid: [
    {
      title: "Reusable sections",
      description:
        "Each block stays small enough to edit but expressive enough to share the essentials quickly.",
    },
    {
      title: "Modern UI tokens",
      description:
        "Tailwind classes, Radix primitives, and your brand tokens plug right into this theme.",
    },
    {
      title: "Ready for scale",
      description:
        "Add, remove, or reorder content while keeping responsive behavior consistent.",
    },
  ],
  ctaSection: {
    eyebrow: "Ready to ship?",
    title: "Make this page your own in minutes",
    description:
      "The layout, hero, highlight cards, pricing, and footer are ready to support your next idea. Just plug in assets, copy, and data.",
    primary: "Start customizing",
    secondary: "View documentation",
  },
} as const;

export type MarketingContent = typeof marketingContent;
