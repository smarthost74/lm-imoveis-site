import { permanentRedirect } from "next/navigation";
import { getListingByNumericId, bairroExiste } from "@/lib/data";
import { extractNumericId } from "@/lib/feed/slug";
import { resolveLegacyImovelPath } from "@/lib/routes";

/**
 * O site antigo indexava uma versão "/mobile/..." separada de cada página
 * de imóvel — puro conteúdo duplicado (ver docs/redirects-301.md, ~58% do
 * total indexado). O site novo é responsivo, não tem site mobile à parte,
 * então tudo aqui vira 301 para a URL canônica única.
 */
export default async function MobileImovelLegacyPage({
  params,
}: {
  params: Promise<{ legacy: string[] }>;
}) {
  const { legacy } = await params;

  if (legacy.length >= 2 && /^\d+$/.test(legacy[0])) {
    const listing = getListingByNumericId(legacy[0]);
    if (listing) {
      permanentRedirect(`/imovel/${extractNumericId(listing.codigoImovel)}/${listing.slug}`);
    }
  }

  permanentRedirect(resolveLegacyImovelPath(legacy, { bairroExiste, cidadePadrao: "taubate" }));
}
