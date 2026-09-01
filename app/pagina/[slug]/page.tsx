import { permanentRedirect } from "next/navigation";

const MAPA: Record<string, string> = {
  "cadastro-de-locatario": "/ficha-cadastro",
  "politica-de-privacidade": "/politica-de-privacidade",
};

/** Conteúdo institucional avulso do site antigo ("/pagina/{slug}"). */
export default async function PaginaLegacyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // "dados-para-financiamento-caixa" e qualquer outra não mapeada: sem
  // equivalente na v1 (simulador CAIXA é v3, ver briefing) — /servicos é o
  // destino mais próximo em vez de mandar para a home.
  permanentRedirect(MAPA[slug] ?? "/servicos");
}
