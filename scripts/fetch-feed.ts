#!/usr/bin/env node
/**
 * Job diário do feed (cron no cPanel). Roda direto com `node`, sem build —
 * Node 24 executa TypeScript nativamente (type stripping). Ver CLAUDE.md.
 *
 *   node --env-file=.env scripts/fetch-feed.ts
 *
 * Fluxo: baixa o feed -> se falhar (rede ou XML inválido), cai para o
 * último XML válido em cache -> parseia -> funde no store (imóvel que sumiu
 * vira "indisponivel", nunca some) -> baixa/re-hospeda imagens novas ->
 * loga características não mapeadas.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseCargaXml } from "../lib/feed/parser.ts";
import { readStore, writeStore, mergeFeedIntoStore } from "../lib/feed/store.ts";
import { ensureListingImages } from "../lib/feed/images.ts";
import type { ParsedFeed } from "../lib/feed/types.ts";

const FEED_CACHE_PATH = "data/feed-cache.xml";

async function fetchFeedXml(): Promise<string> {
  const url = process.env.FEED_CARGA_URL;
  if (!url) {
    throw new Error("FEED_CARGA_URL não configurado (ver .env.example)");
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    mkdirSync(dirname(FEED_CACHE_PATH), { recursive: true });
    writeFileSync(FEED_CACHE_PATH, xml, "utf-8");
    return xml;
  } catch (err) {
    console.error(`[feed] falha ao baixar o feed (${(err as Error).message}), tentando cache...`);
    if (!existsSync(FEED_CACHE_PATH)) {
      throw new Error("sem feed novo e sem cache anterior — abortando");
    }
    return readFileSync(FEED_CACHE_PATH, "utf-8");
  }
}

function parseWithFallback(xml: string): ParsedFeed {
  try {
    return parseCargaXml(xml);
  } catch (err) {
    console.error(`[feed] XML inválido (${(err as Error).message}), tentando cache...`);
    if (!existsSync(FEED_CACHE_PATH)) throw err;
    const cached = readFileSync(FEED_CACHE_PATH, "utf-8");
    return parseCargaXml(cached);
  }
}

async function main() {
  const xml = await fetchFeedXml();
  const parsed = parseWithFallback(xml);

  console.log(`[feed] ${parsed.listings.length} imóveis no feed (gerado em ${parsed.metadata.geradoEm})`);
  if (parsed.metadata.tagsNaoMapeadas.length) {
    console.warn(
      `[feed] características sem mapeamento em lib/feed/characteristics-map.ts: ${parsed.metadata.tagsNaoMapeadas.join(", ")}`
    );
  }

  console.log("[images] baixando/verificando fotos...");
  const listingsComImagens = [];
  for (const listing of parsed.listings) {
    listingsComImagens.push(await ensureListingImages(listing));
  }

  const previous = readStore();
  const merged = mergeFeedIntoStore({ ...parsed, listings: listingsComImagens }, previous);
  writeStore(merged);

  const indisponiveis = Object.values(merged.listings).filter((l) => l.status === "indisponivel").length;
  console.log(
    `[feed] store atualizado: ${parsed.listings.length} ativos, ${indisponiveis} indisponíveis preservados.`
  );
}

main().catch((err) => {
  console.error("[feed] erro fatal:", err);
  process.exitCode = 1;
});
