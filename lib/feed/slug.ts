export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (marcas diacríticas combinantes)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extrai o id numérico do sufixo de CodigoImovel (ex. "APVE057_2-4369235" -> "4369235"). */
export function extractNumericId(codigoImovel: string): string {
  const parts = codigoImovel.split("-");
  return parts[parts.length - 1];
}

/**
 * Slug legível para a URL nova /imovel/{id}/{slug}, preservando o mesmo
 * {id} numérico do site antigo para permitir 301 direto (ver briefing seção 5).
 */
export function buildListingSlug(params: {
  tipoImovel: string;
  finalidade: "venda" | "locacao";
  cidade: string;
  bairro: string;
}): string {
  const { tipoImovel, finalidade, cidade, bairro } = params;
  const acao = finalidade === "venda" ? "venda" : "locacao";
  return slugify(`${tipoImovel}-${acao}-${cidade}-${bairro}`);
}
