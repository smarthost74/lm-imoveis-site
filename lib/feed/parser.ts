import { XMLParser } from "fast-xml-parser";
import type { FeedMetadata, Listing, ListingPhoto, ParsedFeed } from "./types.ts";
import { mapCharacteristics } from "./characteristics-map.ts";
import { sanitizeObservacao } from "./sanitize-description.ts";
import { extractCondominioCandidate } from "./extract-condominio.ts";
import { getConfirmedCondominio } from "./condominio-overrides.ts";
import { buildListingSlug } from "./slug.ts";
import { calcularCustoTotalMensal } from "../format.ts";

/**
 * Campos do schema Carga que NÃO são características booleanas — tudo que
 * não estiver nesta lista e tiver valor "1" é tratado como característica.
 * Ver docs/feed-analysis.md seção 3. Lista aberta: novos campos estruturados
 * que a ImobiBrasil vier a adicionar precisam entrar aqui, senão viram
 * característica por engano.
 */
const KNOWN_STRUCTURED_FIELDS = new Set([
  "CodigoImovel",
  "TituloImovel",
  "TipoImovel",
  "SubTipoImovel",
  "CategoriaImovel",
  "UF",
  "Cidade",
  "Bairro",
  "CEP",
  "Endereco",
  "Numero",
  "Complemento",
  "PrecoVenda",
  "PrecoLocacao",
  "PrecoCondominio",
  "ValorIPTU",
  "AreaUtil",
  "AreaTotal",
  "QtdDormitorios",
  "QtdSuites",
  "QtdBanheiros",
  "QtdVagas",
  "QtdSalas",
  "QtdElevador",
  "TipoOferta",
  "Observacao",
  "Fotos",
  "Latitude",
  "Longitude",
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  isArray: (name, jpath) =>
    jpath === "Carga.Imoveis.Imovel" || jpath === "Carga.Imoveis.Imovel.Fotos.Foto",
});

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function toText(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

const WHATSAPP_IMOBILIARIA = process.env.NEXT_PUBLIC_WHATSAPP_IMOBILIARIA ?? "5512981660001";
const TELEFONE_IMOBILIARIA = "(12) 98166-0001";
const NOME_IMOBILIARIA = "Lobato & Moraes Imóveis";

function parseListing(raw: Record<string, unknown>, unmappedTags: Set<string>): Listing {
  const codigoImovel = toText(raw.CodigoImovel);
  const tipoImovel = toText(raw.TipoImovel);
  const cidade = toText(raw.Cidade);
  const bairro = toText(raw.Bairro);

  const precoVenda = toNumber(raw.PrecoVenda);
  const precoLocacao = toNumber(raw.PrecoLocacao);
  const finalidade: "venda" | "locacao" = precoVenda !== undefined ? "venda" : "locacao";

  const precoCondominio = toNumber(raw.PrecoCondominio);
  const valorIptu = toNumber(raw.ValorIPTU);

  const observacao = raw.Observacao !== undefined ? toText(raw.Observacao) : undefined;
  const { intro, bairro: descricaoBairro } = sanitizeObservacao(observacao);

  const primeiraFraseIntro = intro.split("\n\n")[0];
  const condominioCandidato = extractCondominioCandidate({ primeiraFraseIntro, bairro });
  const condominioConfirmado = getConfirmedCondominio(codigoImovel);

  const caracteristicas: string[] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (KNOWN_STRUCTURED_FIELDS.has(key)) continue;
    if (toText(value) === "1") {
      caracteristicas.push(key);
    }
  }
  const { unmapped } = mapCharacteristics(caracteristicas);
  unmapped.forEach((tag) => unmappedTags.add(tag));

  const fotosRaw = raw.Fotos as { Foto?: unknown[] } | undefined;
  const fotoList = Array.isArray(fotosRaw?.Foto) ? fotosRaw.Foto : fotosRaw?.Foto ? [fotosRaw.Foto] : [];
  const fotos: ListingPhoto[] = (fotoList as Record<string, unknown>[]).map((f) => ({
    filename: toText(f.NomeArquivo),
    sourceUrl: toText(f.URLArquivo),
    isPrimary: toText(f.Principal) === "1",
  }));
  if (fotos.length && !fotos.some((f) => f.isPrimary)) {
    fotos[0].isPrimary = true;
  }

  return {
    codigoImovel,
    slug: buildListingSlug({ tipoImovel, finalidade, cidade, bairro }),
    titulo: toText(raw.TituloImovel),
    tipoImovel,
    subTipoImovel: toText(raw.SubTipoImovel),
    categoriaImovel: toText(raw.CategoriaImovel),
    tipoOfertaRaw: toText(raw.TipoOferta),
    finalidade,
    uf: toText(raw.UF),
    cidade,
    bairro,
    cep: toText(raw.CEP),
    endereco: toText(raw.Endereco),
    numero: toText(raw.Numero),
    condominio: condominioConfirmado ?? condominioCandidato,
    precoVenda,
    precoLocacao,
    precoCondominio,
    valorIptu,
    custoTotalMensal: calcularCustoTotalMensal({ precoLocacao, precoCondominio, valorIptu }),
    areaUtil: toNumber(raw.AreaUtil) ?? 0,
    areaTotal: toNumber(raw.AreaTotal),
    qtdDormitorios: toNumber(raw.QtdDormitorios) ?? 0,
    qtdSuites: toNumber(raw.QtdSuites) ?? 0,
    qtdBanheiros: toNumber(raw.QtdBanheiros) ?? 0,
    qtdVagas: toNumber(raw.QtdVagas) ?? 0,
    qtdSalas: toNumber(raw.QtdSalas),
    qtdElevador: toNumber(raw.QtdElevador),
    descricaoIntro: intro,
    descricaoBairro,
    caracteristicas,
    fotos,
    corretor: {
      nome: NOME_IMOBILIARIA,
      whatsapp: WHATSAPP_IMOBILIARIA,
      telefone: TELEFONE_IMOBILIARIA,
    },
    status: "ativo",
    atualizadoEm: new Date().toISOString(),
  };
}

export function parseCargaXml(xml: string): ParsedFeed {
  const doc = xmlParser.parse(xml);
  const carga = doc?.Carga;
  if (!carga) {
    throw new Error("XML não tem o elemento raiz <Carga> esperado do schema ImobiBrasil");
  }

  const imoveisRaw = carga.Imoveis?.Imovel;
  const imoveis: Record<string, unknown>[] = Array.isArray(imoveisRaw)
    ? imoveisRaw
    : imoveisRaw
      ? [imoveisRaw]
      : [];

  const unmappedTags = new Set<string>();
  const listings = imoveis.map((raw) => parseListing(raw, unmappedTags));

  const metadata: FeedMetadata = {
    geradoEm: toText(carga["@_data"]),
    totalImoveis: listings.length,
    tagsNaoMapeadas: [...unmappedTags].sort(),
  };

  return { metadata, listings };
}
