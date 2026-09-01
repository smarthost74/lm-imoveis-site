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
