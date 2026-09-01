import { COMPANY, SITE_URL } from "@/lib/company";
import type { Listing } from "@/lib/feed/types";

/**
 * Schema JSON-LD (briefing seção 6). Sem Latitude/Longitude no feed (ver
 * docs/feed-analysis.md) e sem geocodificação implementada ainda — `geo`
 * fica de fora dos schemas por enquanto em vez de publicar coordenada
 * inventada. Retomar quando houver geocodificação por endereço (Etapa 7+).
 */

export function realEstateAgentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: COMPANY.nome,
    url: SITE_URL,
    telephone: COMPANY.telefoneExibicao,
    email: COMPANY.emailLeads,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.endereco.logradouro,
      addressLocality: COMPANY.endereco.cidade,
      addressRegion: COMPANY.endereco.uf,
      postalCode: COMPANY.endereco.cep,
      addressCountry: "BR",
    },
    openingHours: "Mo-Fr 09:00-17:00",
    sameAs: [...COMPANY.redesSociais, ...COMPANY.lancamentos.map((l) => l.url)],
  };
}

/**
 * schema.org não reconhece `address`/`floorSize`/`numberOfRooms`/
 * `numberOfBathroomsTotal` como propriedades diretas de `RealEstateListing`
 * (é um tipo "Listing", intangível — validado no validator.schema.org,
 * gerava 4 avisos). Esses atributos físicos pertencem a uma entidade de
 * acomodação, referenciada via `about`.
 */
function tipoImovelToSchemaType(tipoImovel: string): string {
  const t = tipoImovel.toLowerCase();
  if (t.includes("apartamento")) return "Apartment";
  if (t.includes("casa") || t.includes("sobrado")) return "House";
  return "Accommodation";
}

export function realEstateListingJsonLd(listing: Listing, urlPagina: string) {
  const preco = listing.finalidade === "venda" ? listing.precoVenda : listing.precoLocacao;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    url: urlPagina,
    name: listing.titulo,
    description: listing.descricaoIntro.slice(0, 300) || listing.titulo,
    datePosted: listing.atualizadoEm,
    // localPath é relativo (precisa do SITE_URL); sourceUrl já vem absoluto do feed.
    image: listing.fotos.map((f) => (f.localPath ? `${SITE_URL}${f.localPath}` : f.sourceUrl)),
    about: {
      "@type": tipoImovelToSchemaType(listing.tipoImovel),
      address: {
        "@type": "PostalAddress",
        streetAddress: `${listing.endereco}, ${listing.numero}`,
        addressLocality: listing.cidade,
        addressRegion: listing.uf,
        postalCode: listing.cep,
        addressCountry: "BR",
      },
      floorSize: {
        "@type": "QuantitativeValue",
        value: listing.areaTotal ?? listing.areaUtil,
        unitCode: "MTK",
      },
      numberOfRooms: listing.qtdDormitorios,
      numberOfBathroomsTotal: listing.qtdBanheiros,
    },
    ...(preco !== undefined
      ? {
          offers: {
            "@type": "Offer",
            price: preco,
            priceCurrency: "BRL",
            availability:
              listing.status === "ativo"
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: item.url,
    })),
  };
}
