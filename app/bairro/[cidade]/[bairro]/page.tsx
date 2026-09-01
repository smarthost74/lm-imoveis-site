import { permanentRedirect } from "next/navigation";
import { bairroExiste } from "@/lib/data";

/**
 * Só redireciona para a página de bairro se ela tiver estoque ativo hoje —
 * senão a página de destino 404 e o 301 vira um beco sem saída (achado ao
 * testar as 370 URLs do Search Console, ver docs/redirects-301.md).
 */
export default async function BairroLegacyPage({
  params,
}: {
  params: Promise<{ cidade: string; bairro: string }>;
}) {
  const { cidade, bairro } = await params;
  permanentRedirect(bairroExiste(cidade, bairro) ? `/imoveis/${cidade}/${bairro}` : `/comprar/${cidade}`);
}
