/**
 * `Observacao` do feed Carga tem uma estrutura em blocos (ver
 * docs/feed-analysis.md seção 7), não um corte único:
 *
 *   [intro única] "Resumo do imóvel:" [bullets repetindo campos estruturados]
 *   [parágrafo sobre bairro/condomínio] "Valor de venda: ... Agende sua visita..."
 *   [segunda lista de características repetida]
 *
 * O texto de origem também tem um bug de template recorrente: sentenças
 * grudadas sem espaço nem <br> entre elas (ex. "condomínioO Residencial",
 * "TaubatéSP"). Corrigimos isso tratando qualquer transição de
 * minúscula/dígito para maiúscula, ou de ponto final para maiúscula sem
 * espaço, como quebra de parágrafo — é exatamente onde o bug acontece nos
 * casos observados.
 */

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function splitIntoParagraphs(raw: string): string[] {
  let text = decodeEntities(raw);
  text = text.replace(/<br\s*\/?>/gi, "\n");
  // bug de template: "palavraPalavra" ou "123Palavra" grudados sem separador
  text = text.replace(/([a-zà-ÿ0-9])([A-ZÀ-Ú])/g, "$1\n$2");
  // bug de template: "frase.Próxima" sem espaço após o ponto
  text = text.replace(/\.(?=[A-ZÀ-Ú])/g, ".\n");

  return text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

const RESUMO_MARKER = /^resumo do im[oó]vel:?/i;
const END_MARKERS = /^(valor de (venda|aluguel|loca[cç][aã]o)|agende sua visita)/i;

export interface SanitizedDescription {
  /** Parágrafos únicos de abertura, para exibir como descrição do imóvel. */
  intro: string;
  /** Parágrafo(s) sobre o bairro/condomínio — insumo para a página de bairro/condomínio. */
  bairro?: string;
}

export function sanitizeObservacao(raw: string | undefined | null): SanitizedDescription {
  if (!raw || !raw.trim()) return { intro: "" };

  const paragraphs = splitIntoParagraphs(raw);

  const introParts: string[] = [];
  const bairroParts: string[] = [];
  let phase: "intro" | "resumo" | "post-bairro" = "intro";

  for (const paragraph of paragraphs) {
    if (phase === "intro") {
      if (RESUMO_MARKER.test(paragraph)) {
        phase = "resumo";
        continue;
      }
      introParts.push(paragraph);
      continue;
    }

    if (phase === "resumo") {
      if (paragraph.startsWith("-")) continue; // bullet do resumo, descartar
      if (END_MARKERS.test(paragraph)) break;
      bairroParts.push(paragraph);
      phase = "post-bairro";
      continue;
    }

    // phase === "post-bairro"
    if (END_MARKERS.test(paragraph)) break;
    if (paragraph.startsWith("-")) break; // segunda lista de características repetida
    bairroParts.push(paragraph);
  }

  return {
    intro: introParts.join("\n\n"),
    bairro: bairroParts.length ? bairroParts.join(" ") : undefined,
  };
}
