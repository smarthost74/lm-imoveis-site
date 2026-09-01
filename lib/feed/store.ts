import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Listing, ParsedFeed } from "./types.ts";

/**
 * Store persistente de listings, fora do controle do Git (ver .gitignore).
 * Chave = codigoImovel. Um imóvel que sai do feed não é apagado — vira
 * status "indisponivel" para a página existente virar "Vendido" em vez de
 * 404 (ver briefing seção 4, regra do feed).
 */
export const STORE_PATH = "data/listings.json";

export interface ListingStore {
  atualizadoEm: string;
  listings: Record<string, Listing>;
}

export function readStore(path: string = STORE_PATH): ListingStore | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as ListingStore;
  } catch {
    return null;
  }
}

export function writeStore(store: ListingStore, path: string = STORE_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Funde o resultado recém-parseado do feed com o store anterior: imóveis
 * presentes no feed novo entram/atualizam como "ativo"; imóveis que
 * estavam no store antigo e sumiram do feed novo viram "indisponivel"
 * (preservados, não removidos).
 */
export function mergeFeedIntoStore(parsed: ParsedFeed, previous: ListingStore | null): ListingStore {
  const merged: Record<string, Listing> = { ...previous?.listings };

  for (const listing of parsed.listings) {
    merged[listing.codigoImovel] = listing;
  }

  const activeIds = new Set(parsed.listings.map((l) => l.codigoImovel));
  for (const [codigoImovel, listing] of Object.entries(merged)) {
    if (!activeIds.has(codigoImovel) && listing.status === "ativo") {
      merged[codigoImovel] = { ...listing, status: "indisponivel" };
    }
  }

  return {
    atualizadoEm: new Date().toISOString(),
    listings: merged,
  };
}
