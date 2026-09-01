import { readFileSync, existsSync } from "node:fs";
import { cache } from "react";
import type { Listing } from "./feed/types";
import type { ListingStore } from "./feed/store";
import { STORE_PATH } from "./feed/store";
import { slugify } from "./feed/slug";

/**
 * Camada de leitura para as páginas (server components). O store é gerado
 * pelo job diário (scripts/fetch-feed.ts) em data/listings.json, fora do
 * Git. Se ainda não existir (clone novo, pipeline não rodou), as páginas
 * degradam para "sem imóveis" em vez de quebrar o build/render.
 */
const getStore = cache((): ListingStore => {
  if (!existsSync(STORE_PATH)) {
    console.warn(`[data] ${STORE_PATH} não existe ainda — rode "npm run feed:fetch"`);
    return { atualizadoEm: "", listings: {} };
  }
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf-8")) as ListingStore;
  } catch {
    console.warn(`[data] falha ao ler ${STORE_PATH}`);
    return { atualizadoEm: "", listings: {} };
  }
});

/** Nome de exibição da cidade (com acento/capitalização) a partir do slug da URL. */
export function resolveCidadeNome(cidadeSlug: string): string {
  const listing = getAllListings().find((l) => slugify(l.cidade) === slugify(cidadeSlug));
  return listing?.cidade ?? cidadeSlug.replace(/-/g, " ");
}

export function getAllListings(): Listing[] {
  return Object.values(getStore().listings);
}

export function getActiveListings(): Listing[] {
  return getAllListings().filter((l) => l.status === "ativo");
}

export function getListingByCodigo(codigoImovel: string): Listing | undefined {
  return getStore().listings[codigoImovel];
}

export function getListingByNumericId(numericId: string): Listing | undefined {
  return getAllListings().find((l) => l.codigoImovel.endsWith(`-${numericId}`));
}

export interface BairroSummary {
  cidade: string;
  bairro: string;
  slug: string;
  totalAtivos: number;
}

export function getBairros(): BairroSummary[] {
  const map = new Map<string, BairroSummary>();
  for (const l of getActiveListings()) {
    const key = `${l.cidade}::${l.bairro}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalAtivos++;
    } else {
      map.set(key, { cidade: l.cidade, bairro: l.bairro, slug: slugify(l.bairro), totalAtivos: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.totalAtivos - a.totalAtivos);
}

export function getListingsByBairro(cidade: string, bairroSlug: string): Listing[] {
  return getActiveListings().filter(
    (l) => slugify(l.cidade) === slugify(cidade) && slugify(l.bairro) === bairroSlug
  );
}

export interface CondominioSummary {
  cidade: string;
  bairro: string;
  condominio: string;
  slug: string;
  totalAtivos: number;
}

/** Só considera condomínio confirmado manualmente (ver lib/feed/condominio-overrides.ts). */
export function getCondominios(): CondominioSummary[] {
  const map = new Map<string, CondominioSummary>();
  for (const l of getActiveListings()) {
    if (!l.condominio) continue;
    const key = `${l.cidade}::${l.condominio}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalAtivos++;
    } else {
      map.set(key, {
        cidade: l.cidade,
        bairro: l.bairro,
        condominio: l.condominio,
        slug: slugify(l.condominio),
        totalAtivos: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.totalAtivos - a.totalAtivos);
}

export function getListingsByCondominio(cidade: string, condominioSlug: string): Listing[] {
  return getActiveListings().filter(
    (l) => slugify(l.cidade) === slugify(cidade) && l.condominio && slugify(l.condominio) === condominioSlug
  );
}

export function getListingsSemelhantes(listing: Listing, limit = 4): Listing[] {
  const mesmoCondominio = listing.condominio
    ? getActiveListings().filter(
        (l) => l.codigoImovel !== listing.codigoImovel && l.condominio === listing.condominio
      )
    : [];
  const mesmoBairro = getActiveListings().filter(
    (l) => l.codigoImovel !== listing.codigoImovel && l.bairro === listing.bairro && l.condominio !== listing.condominio
  );
  return [...mesmoCondominio, ...mesmoBairro].slice(0, limit);
}
