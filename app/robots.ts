import { MetadataRoute } from "next";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/list",
          "/billing",
          "/earnings",
          "/settings",
          "/users",
          "/share",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
