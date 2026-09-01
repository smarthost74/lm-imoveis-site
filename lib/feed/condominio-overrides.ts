import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OVERRIDES_PATH = join(__dirname, "..", "..", "content", "condominio-overrides.json");

interface CondominioOverrideEntry {
  codigoImovel: string;
  condominio: string;
  confirmado: boolean;
  origem: string;
}

let cache: Map<string, CondominioOverrideEntry> | null = null;

function loadOverrides(): Map<string, CondominioOverrideEntry> {
  if (cache) return cache;
  const raw = JSON.parse(readFileSync(OVERRIDES_PATH, "utf-8")) as {
    overrides: CondominioOverrideEntry[];
  };
  cache = new Map(raw.overrides.map((entry) => [entry.codigoImovel, entry]));
  return cache;
}

/** Só retorna o nome do condomínio quando a entrada foi confirmada por humano. */
export function getConfirmedCondominio(codigoImovel: string): string | undefined {
  const entry = loadOverrides().get(codigoImovel);
  return entry?.confirmado ? entry.condominio : undefined;
}
