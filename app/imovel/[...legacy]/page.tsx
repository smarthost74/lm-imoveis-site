import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { BrokerCard } from "@/components/BrokerCard";
import { WhatsappCtaLink } from "@/components/WhatsappCtaLink";
import { ImovelCard } from "@/components/ImovelCard";
import { getListingByNumericId, getListingsSemelhantes, bairroExiste } from "@/lib/data";
import { groupCharacteristics } from "@/lib/feed/characteristics-map";
import { formatArea, formatCurrency } from "@/lib/format";
import { slugify } from "@/lib/feed/slug";
import { buildWhatsappLink, COMPANY, SITE_URL } from "@/lib/company";
import { breadcrumbJsonLd, realEstateListingJsonLd } from "@/lib/seo/jsonld";
import { resolveLegacyImovelPath } from "@/lib/routes";

/**
 * Rota única para /imovel/*: cobre tanto a URL nova de imóvel individual
 * (`/imovel/{id}/{slug}`, preservada do site antigo — ver briefing seção 5)
 * quanto todo padrão legado indexado no Search Console em 01/09/2026
 * (`/imovel/{finalidade}/...`, `/imovel/{id}/{slug-antigo-fora-do-feed}`).
 * Um catch-all (`[...legacy]`) e um segmento dinâmico nomeado (`[id]`) não
 * podem coexistir como irmãos no mesmo nível de rota no Next.js — por isso
 * as duas responsabilidades ficam juntas aqui em vez de em arquivos
 * separados. Ver docs/redirects-301.md para o mapeamento completo.
 */

function isPropertyIdShape(segments: string[]): boolean {
  return segments.length >= 2 && /^\d+$/.test(segments[0]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ legacy: string[] }>;
}): Promise<Metadata> {
  const { legacy } = await params;
  if (!isPropertyIdShape(legacy)) return {};
  const listing = getListingByNumericId(legacy[0]);
  if (!listing) return {};
  return {
    title: listing.titulo,
    description: listing.descricaoIntro.slice(0, 155) || `${listing.titulo} — ${COMPANY.nome}`,
  };
}

export default async function ImovelPage({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;

  if (isPropertyIdShape(legacy)) {
    const listing = getListingByNumericId(legacy[0]);
    if (listing) return <ImovelDetalhe listing={listing} id={legacy[0]} />;
  }

  // Não é (ou não resolve para) um imóvel do feed atual — redirect 301 (308,
  // equivalente para o Google) para o destino mais relevante possível.
  permanentRedirect(resolveLegacyImovelPath(legacy, { bairroExiste, cidadePadrao: "taubate" }));
}

function ImovelDetalhe({ listing, id }: { listing: NonNullable<ReturnType<typeof getListingByNumericId>>; id: string }) {
  const indisponivel = listing.status === "indisponivel";
  const grupos = groupCharacteristics(listing.caracteristicas);
  const semelhantes = getListingsSemelhantes(listing);
  const enderecoCompleto = `${listing.endereco}, ${listing.numero} - ${listing.bairro}, ${listing.cidade}/${listing.uf}`;
  const urlPagina = `${SITE_URL}/imovel/${id}/${listing.slug}`;
  const mensagemWhatsapp = `Olá! Tenho interesse no imóvel ${listing.titulo} (código ${listing.codigoImovel}), em ${enderecoCompleto}. ${urlPagina}`;

  const breadcrumbItems = [
    { nome: "Home", url: SITE_URL },
    {
      nome: listing.finalidade === "venda" ? "Comprar" : "Alugar",
      url: `${SITE_URL}/${listing.finalidade === "venda" ? "comprar" : "alugar"}`,
    },
    {
      nome: listing.bairro,
      url: `${SITE_URL}/imoveis/${slugify(listing.cidade)}/${slugify(listing.bairro)}`,
    },
    { nome: listing.titulo, url: urlPagina },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateListingJsonLd(listing, urlPagina)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />

      <nav aria-label="Breadcrumb" className="py-4 text-sm text-texto-suave">
        <Link href="/" className="hover:text-navy">Home</Link>
        {" / "}
        <Link href={listing.finalidade === "venda" ? "/comprar" : "/alugar"} className="hover:text-navy">
          {listing.finalidade === "venda" ? "Comprar" : "Alugar"}
        </Link>
        {" / "}
        <Link href={`/imoveis/${slugify(listing.cidade)}/${slugify(listing.bairro)}`} className="hover:text-navy">
          {listing.bairro}
        </Link>
        {" / "}
        <span className="text-navy">{listing.titulo}</span>
      </nav>

      <Gallery fotos={listing.fotos} tituloImovel={listing.titulo} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {indisponivel && (
            <div className="mb-4 rounded-lg bg-navy px-4 py-3 text-white">
              Este imóvel já foi {listing.finalidade === "venda" ? "vendido" : "alugado"}. Veja
              opções semelhantes mais abaixo.
            </div>
          )}

          <h1 className="font-display text-2xl text-navy sm:text-3xl">{listing.titulo}</h1>
          <p className="mt-1 text-texto-suave">{enderecoCompleto}</p>

          <p className="mt-4 font-display text-3xl text-navy">
            {listing.finalidade === "venda" && listing.precoVenda !== undefined
              ? formatCurrency(listing.precoVenda)
              : listing.custoTotalMensal !== undefined
                ? `${formatCurrency(listing.custoTotalMensal)}/mês`
                : "Consulte o valor"}
          </p>
          {listing.finalidade === "locacao" && listing.precoLocacao !== undefined && (
            <p className="text-sm text-texto-suave">
              aluguel {formatCurrency(listing.precoLocacao)}
              {listing.precoCondominio ? ` + condomínio ${formatCurrency(listing.precoCondominio)}` : ""}
              {listing.valorIptu ? ` + IPTU ${formatCurrency(listing.valorIptu)}` : ""}
            </p>
          )}

          {!indisponivel && (
            <WhatsappCtaLink
              href={buildWhatsappLink({ telefone: listing.corretor.whatsapp, mensagem: mensagemWhatsapp })}
              origem="imovel-mobile-cta"
              className="mt-4 inline-flex items-center gap-2 rounded bg-[#25D366] px-5 py-3 font-medium text-white hover:brightness-95 lg:hidden"
            >
              Falar no WhatsApp sobre este imóvel
            </WhatsappCtaLink>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-borda bg-white p-5 sm:grid-cols-5">
            <FichaItem label="Dormitórios" value={listing.qtdDormitorios} />
            <FichaItem label="Suítes" value={listing.qtdSuites} />
            <FichaItem label="Banheiros" value={listing.qtdBanheiros} />
            <FichaItem label="Vagas" value={listing.qtdVagas} />
            <FichaItem label="Área" value={formatArea(listing.areaTotal ?? listing.areaUtil)} />
          </dl>

          {listing.descricaoIntro && (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl text-navy">Descrição</h2>
              <div className="flex flex-col gap-3 text-texto-suave">
                {listing.descricaoIntro.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {grupos.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl text-navy">Características</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {grupos.map((g) => (
                  <div key={g.group}>
                    <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-texto-suave">
                      {g.groupLabel}
                    </h3>
                    <ul className="flex flex-col gap-1 text-sm text-navy">
                      {g.items.map((item) => (
                        <li key={item.key}>{item.label}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {listing.descricaoBairro && (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl text-navy">
                Sobre {listing.condominio ?? listing.bairro}
              </h2>
              <p className="text-texto-suave">{listing.descricaoBairro}</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-3 font-display text-xl text-navy">Localização</h2>
            <div className="aspect-video overflow-hidden rounded-lg border border-borda">
              <iframe
                title={`Mapa de ${enderecoCompleto}`}
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`}
              />
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <BrokerCard
            nome={listing.corretor.nome}
            telefone={listing.corretor.telefone}
            whatsapp={listing.corretor.whatsapp}
            mensagemWhatsapp={mensagemWhatsapp}
            sticky
          />
        </div>
      </div>

      {semelhantes.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl text-navy">
            Imóveis semelhantes{" "}
            {semelhantes.some((l) => l.condominio && l.condominio === listing.condominio)
              ? "no mesmo condomínio"
              : "no mesmo bairro"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {semelhantes.map((l) => (
              <ImovelCard key={l.codigoImovel} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function FichaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-texto-suave">{label}</dt>
      <dd className="font-display text-lg text-navy">{value}</dd>
    </div>
  );
}
