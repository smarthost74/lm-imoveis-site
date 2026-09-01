import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { realEstateAgentJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/company";
import "./globals.css";

/**
 * Montserrat + Poppins — não Playfair Display/DM Sans do briefing inicial.
 * Confirmado como a tipografia real da marca a partir dos arquivos da
 * própria imobiliária (Villa Mozart, um dos lançamentos, usa exatamente
 * essas duas famílias — 01/09/2026). Pedido explícito do usuário: fontes
 * sans-serif, não a serifada original.
 */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}
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
