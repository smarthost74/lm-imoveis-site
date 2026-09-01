import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { ImovelCard } from "@/components/ImovelCard";
import {
  getBairros,
  getCondominios,
  getListingsByBairro,
  getListingsByCondominio,
} from "@/lib/data";
import { formatCurrency } from "@/lib/format";

/**
 * Resolve o segundo segmento como bairro OU condomínio (mesma forma de URL
 * para os dois — ver briefing seção 5). Só existe página quando há estoque
 * real, para não gerar conteúdo raso (ver briefing seção 5.5).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string; localidade: string }>;
}): Promise<Metadata> {
  const { localidade } = await params;
  const bairro = getBairros().find((b) => b.slug === localidade);
  const condominio = getCondominios().find((c) => c.slug === localidade);
  const nome = bairro?.bairro ?? condominio?.condominio;
  const cidadeNome = bairro?.cidade ?? condominio?.cidade;
  if (!nome) return {};
  return { title: `Imóveis em ${nome} — ${cidadeNome}` };
}

export default async function LocalidadePage({
  params,
}: {
  params: Promise<{ cidade: string; localidade: string }>;
}) {
  const { cidade, localidade } = await params;

  const bairroInfo = getBairros().find((b) => b.slug === localidade);
  const condominioInfo = getCondominios().find((c) => c.slug === localidade);

  if (!bairroInfo && !condominioInfo) notFound();

  const listings = bairroInfo
    ? getListingsByBairro(cidade, localidade)
    : getListingsByCondominio(cidade, localidade);

  if (!listings.length) notFound();

  const nome = bairroInfo?.bairro ?? condominioInfo!.condominio;
  const cidadeNome = listings[0].cidade;
  const tipo = bairroInfo ? "bairro" : "condomínio";

  const precos = listings.map((l) => l.precoVenda ?? l.custoTotalMensal ?? 0).filter(Boolean);
  const precoMin = precos.length ? Math.min(...precos) : undefined;
  const precoMax = precos.length ? Math.max(...precos) : undefined;

  // Em página de condomínio, a descrição de qualquer imóvel do condomínio serve.
  // Em página de bairro, só usar descrição de imóvel SEM condomínio próprio —
  // senão o texto do condomínio de um imóvel específico passaria por
  // descrição do bairro inteiro (enganoso).
  const descricaoUnica = bairroInfo
    ? listings.find((l) => l.descricaoBairro && !l.condominio)?.descricaoBairro
    : listings.find((l) => l.descricaoBairro)?.descricaoBairro;

  return (
    <main className="pb-16">
      <Hero
        imageSrc="/demo/card.svg"
        imageAlt={`${tipo === "bairro" ? "Bairro" : "Condomínio"} ${nome}`}
        eyebrow={cidadeNome}
        headline={nome}
        subheadline={`${listings.length} ${listings.length === 1 ? "imóvel disponível" : "imóveis disponíveis"} neste ${tipo}`}
        minHeight="min-h-[320px]"
      />

      <div className="mx-auto max-w-6xl px-4">
        {precoMin !== undefined && (
          <section className="mt-8">
            <h2 className="mb-2 font-display text-xl text-navy">
              Quanto custa comprar em {nome}?
            </h2>
            <p className="max-w-3xl text-texto-suave">
              {listings.length === 1
                ? `O único imóvel disponível hoje em ${nome} está anunciado por ${formatCurrency(precoMin)}. `
                : `Os imóveis disponíveis hoje em ${nome} variam de ${formatCurrency(precoMin!)} a ${formatCurrency(precoMax!)}. `}
              Os valores mudam conforme a carteira é atualizada — fale com a gente para uma
              indicação personalizada ao seu orçamento.
            </p>
          </section>
        )}

        {descricaoUnica && (
          <section className="mt-6">
            <p className="max-w-3xl text-texto-suave">{descricaoUnica}</p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-6 font-display text-xl text-navy">
            Imóveis disponíveis em {nome}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ImovelCard key={l.codigoImovel} listing={l} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
