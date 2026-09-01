import type { MetadataRoute } from "next";
import { getActiveListings, getBairros, getCondominios } from "@/lib/data";
import { extractNumericId, slugify } from "@/lib/feed/slug";
import { SITE_URL } from "@/lib/company";

const PAGINAS_ESTATICAS = [
  "",
  "/quem-somos",
  "/lancamentos",
  "/servicos",
  "/contato",
  "/politica-de-privacidade",
  "/comprar/taubate",
  "/alugar/taubate",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const listings = getActiveListings();

  const paginasEstaticas: MetadataRoute.Sitemap = PAGINAS_ESTATICAS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  const paginasImovel: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/imovel/${extractNumericId(l.codigoImovel)}/${l.slug}`,
    lastModified: l.atualizadoEm,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const paginasBairroCondominio: MetadataRoute.Sitemap = [
    ...getBairros().map((b) => `${SITE_URL}/imoveis/${slugify(b.cidade)}/${b.slug}`),
    ...getCondominios().map((c) => `${SITE_URL}/imoveis/${slugify(c.cidade)}/${c.slug}`),
  ].map((url) => ({ url, changeFrequency: "daily" as const, priority: 0.7 }));

  const tiposFinalidadeCidade = new Set(
    listings.map((l) => {
      const acao = l.finalidade === "venda" ? "a-venda-em" : "para-alugar-em";
      return `${slugify(l.tipoImovel)}-${acao}-${slugify(l.cidade)}`;
    })
  );
  const paginasTipoFinalidade: MetadataRoute.Sitemap = [...tiposFinalidadeCidade].map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...paginasEstaticas, ...paginasImovel, ...paginasBairroCondominio, ...paginasTipoFinalidade];
}
