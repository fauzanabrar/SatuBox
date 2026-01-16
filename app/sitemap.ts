import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

const baseUrl =
  process.env.BASE_URL ?? siteConfig.website ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    "",
    "/login",
    "/register",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/faq",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.4,
  }));
}
