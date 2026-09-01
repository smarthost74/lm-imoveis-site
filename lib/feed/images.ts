import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Listing } from "./types.ts";

/**
 * As fotos do feed apontam para o próprio domínio da ImobiBrasil/site atual
 * — quebram no cutover (ver briefing seção 4, regra 3). Baixamos e
 * re-hospedamos em /public/imoveis-cache/{codigoImovel}/{filename},
 * idempotente (pula o que já existe) para o job diário não rebaixar tudo.
 */
export const IMAGES_CACHE_DIR = "public/imoveis-cache";

function localDirFor(codigoImovel: string): string {
  return join(IMAGES_CACHE_DIR, codigoImovel);
}

export function localPathFor(codigoImovel: string, filename: string): string {
  return join(IMAGES_CACHE_DIR, codigoImovel, filename).replace(/\\/g, "/");
}

/** Caminho público (servido pelo Next.js a partir de /public) para uso em <img src>. */
export function publicPathFor(codigoImovel: string, filename: string): string {
  return `/imoveis-cache/${codigoImovel}/${filename}`;
}

async function downloadOne(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[images] HTTP ${res.status} ao baixar ${url}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.warn(`[images] falha ao baixar ${url}:`, (err as Error).message);
    return false;
  }
}

/**
 * Baixa as fotos de um listing que ainda não existem localmente. Concorrência
 * limitada para não sobrecarregar o servidor de origem.
 */
export async function ensureListingImages(listing: Listing, concurrency = 4): Promise<Listing> {
  const dir = localDirFor(listing.codigoImovel);
  mkdirSync(dir, { recursive: true });

  const fotos = [...listing.fotos];
  const queue = fotos.map((foto, index) => ({ foto, index }));

  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;
      const { foto, index } = item;
      const destPath = join(dir, foto.filename);
      if (!existsSync(destPath)) {
        const ok = await downloadOne(foto.sourceUrl, destPath);
        if (!ok) continue;
      }
      fotos[index] = { ...foto, localPath: publicPathFor(listing.codigoImovel, foto.filename) };
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  return { ...listing, fotos };
}
