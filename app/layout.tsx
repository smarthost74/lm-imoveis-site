import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { realEstateAgentJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/company";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lobato & Moraes Imóveis — Imobiliária em Taubaté/SP",
    template: "%s | Lobato & Moraes Imóveis",
  },
  description:
    "Imóveis à venda em Taubaté/SP. Carteira curada, atendimento direto com corretores CRECI, imobiliária com sede na Avenida Itália.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-creme text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentJsonLd()) }}
        />
        <GoogleAnalytics />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
