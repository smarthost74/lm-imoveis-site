/**
 * Parser para as URLs "tipo + finalidade + cidade" (briefing seção 5):
 *   /{tipo}-a-venda-em-{cidade}/
 *   /{tipo}-para-alugar-em-{cidade}/
 */
export function parseTipoFinalidadeCidadeSlug(
  slug: string
): { tipoSlug: string; finalidade: "venda" | "locacao"; cidadeSlug: string } | null {
  let m = slug.match(/^(.+)-a-venda-em-(.+)$/);
  if (m) return { tipoSlug: m[1], finalidade: "venda", cidadeSlug: m[2] };

  m = slug.match(/^(.+)-para-alugar-em-(.+)$/);
  if (m) return { tipoSlug: m[1], finalidade: "locacao", cidadeSlug: m[2] };

  return null;
}

/**
 * Redirects 301 do site atual (plataforma ImobiBrasil), a partir do
 * inventário exportado do Search Console em 01/09/2026 (ver
 * docs/redirects-301.md). Padrões cobertos:
 *
 *   /imovel/{id}/{slug}                                  -> já é a forma nova
 *   /imovel/{id}/{slug-generico-antigo}                  -> id fora do feed: cascata abaixo
 *   /imovel/{finalidade}                                 -> /comprar|/alugar
 *   /imovel/{finalidade}/{tipo}[/{cidade}]                -> /{tipo}-a-venda-em-{cidade}
 *   /imovel/{finalidade}/{tipo}/{cidade}/{bairro}-{id}    -> /imoveis/{cidade}/{bairro} (se tiver estoque) senão tipo+finalidade
 *   /mobile/imovel/...                                    -> mesmas regras, "mobile" ignorado (sem site mobile separado)
 *   /bairro/{cidade}/{bairro}                             -> /imoveis/{cidade}/{bairro}
 *
 * Nunca retorna undefined para um padrão reconhecido — sempre cai em um
 * fallback topicamente relevante (nunca redireciona para 404).
 */

const FINALIDADE_MAP: Record<string, "venda" | "locacao"> = {
  venda: "venda",
  locacao: "locacao",
  loc: "locacao",
  aluguel: "locacao",
};

/** Heurística: extrai um possível slug de bairro do final de um slug de imóvel antigo. */
function inferBairroSlugFromPropertySlug(slug: string): string | undefined {
  const tokens = slug.split("-");
  // pula tipo e finalidade (2 primeiros tokens) e, se presentes, "taubate"/"sp"
  let rest = tokens.slice(2);
  if (rest[0] === "taubate") rest = rest.slice(1);
  if (rest[0] === "sp") rest = rest.slice(1);
  return rest.length ? rest.join("-") : undefined;
}

export interface LegacyRedirectContext {
  bairroExiste: (cidadeSlug: string, bairroSlug: string) => boolean;
  cidadePadrao: string;
}

/**
 * Resolve um caminho de imóvel legado (`/imovel/...` ou, com "mobile" já
 * removido do início, `/mobile/imovel/...`) para o destino novo. `segments`
 * são os segmentos de path DEPOIS de "imovel".
 */
export function resolveLegacyImovelPath(
  segments: string[],
  ctx: LegacyRedirectContext
): string {
  const { bairroExiste, cidadePadrao } = ctx;

  if (segments.length === 0) return `/comprar/${cidadePadrao}`;

  // /imovel/{id}/{slug} — id numérico de imóvel individual fora do feed atual
  if (segments.length >= 2 && /^\d+$/.test(segments[0])) {
    const slug = segments[1];
    const bairroSlug = inferBairroSlugFromPropertySlug(slug);
    if (bairroSlug && bairroExiste(cidadePadrao, bairroSlug)) {
      return `/imoveis/${cidadePadrao}/${bairroSlug}`;
    }
    const tipo = slug.split("-")[0];
    const finalidadeToken = slug.split("-")[1];
    const finalidade = FINALIDADE_MAP[finalidadeToken] ?? "venda";
    return finalidade === "venda"
      ? `/${tipo}-a-venda-em-${cidadePadrao}`
      : `/${tipo}-para-alugar-em-${cidadePadrao}`;
  }

  // /imovel/{finalidade}[/{tipo}[/{cidade}[/{bairro}-{id}]]]
  const finalidade = FINALIDADE_MAP[segments[0]] ?? "venda";
  const base = finalidade === "venda" ? `/comprar/${cidadePadrao}` : `/alugar/${cidadePadrao}`;

  if (segments.length === 1) return base;

  const tipo = segments[1];
  const tipoPath =
    finalidade === "venda" ? `/${tipo}-a-venda-em-${cidadePadrao}` : `/${tipo}-para-alugar-em-${cidadePadrao}`;

  if (segments.length <= 3) return tipoPath;

  // segments[3] é "{bairro}-{idNumerico}" — remove o sufixo numérico
  const bairroComId = segments[3];
  const bairroSlug = bairroComId.replace(/-\d+$/, "");
  if (bairroExiste(cidadePadrao, bairroSlug)) {
    return `/imoveis/${cidadePadrao}/${bairroSlug}`;
  }
  return tipoPath;
}
