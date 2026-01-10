import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/jotai/providers";
import Toaster from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Satubox",
  description: "Satubox",
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
