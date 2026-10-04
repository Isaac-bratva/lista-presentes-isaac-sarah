import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Karla } from "next/font/google";
import EditorProvider from "@/components/EditorProvider";
import { getSettings } from "@/lib/data";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.coupleTitle} · Lista de presentes`;
  return {
    title,
    description: `${settings.listTitle} — ${settings.listSubtitle}`,
    openGraph: {
      title,
      description: settings.listSubtitle,
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${karla.variable}`}>
      <body className="bg-cream text-ink antialiased">
        <EditorProvider>{children}</EditorProvider>
      </body>
    </html>
  );
}
