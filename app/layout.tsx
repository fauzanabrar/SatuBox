import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/jotai/providers";
import Toaster from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Satubox",
    template: "%s | Satubox",
  },
  description: "Share files fast, control access, and manage storage.",
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("theme");
    const theme = stored === "dark" || stored === "light" ? stored : "light";
    if (!stored) localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {
    // no-op
  }
})();
`;

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
