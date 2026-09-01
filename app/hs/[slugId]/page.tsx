import { permanentRedirect } from "next/navigation";
import { condominioExiste } from "@/lib/data";
import { COMPANY } from "@/lib/company";
import { slugify } from "@/lib/feed/slug";

/**
 * "/hs/{slug}-{id}" era a URL de hotsite de empreendimento no site antigo.
 * Cascata: condomínio ativo no catálogo atual -> lançamento parceiro
 * (Borgo Belluno / Villa Mozart, por nome) -> fallback genérico.
 */
export default async function HotsiteLegacyPage({ params }: { params: Promise<{ slugId: string }> }) {
  const { slugId } = await params;
  const slug = slugId.replace(/-\d+$/, "");

  if (condominioExiste("taubate", slug)) {
    permanentRedirect(`/imoveis/taubate/${slug}`);
  }

  const lancamento = COMPANY.lancamentos.find((l) => slugify(l.nome) === slug || slug.includes(slugify(l.nome)));
  if (lancamento) {
    permanentRedirect(lancamento.url);
  }

  permanentRedirect("/comprar/taubate");
}
