import { readFileSync } from "node:fs";
import { parseCargaXml } from "../lib/feed/parser.ts";
import { mergeFeedIntoStore } from "../lib/feed/store.ts";

const xml = readFileSync("docs/feed-carga-raw.xml", "utf-8");
const parsed = parseCargaXml(xml);

// Primeira rodada: todos os 8 entram como ativos.
const store1 = mergeFeedIntoStore(parsed, null);
console.log("rodada 1:", Object.values(store1.listings).map((l) => `${l.codigoImovel}:${l.status}`));

// Segunda rodada: simula o feed do dia seguinte sem o primeiro imóvel (vendido).
const parsedSemUm = { ...parsed, listings: parsed.listings.slice(1) };
const store2 = mergeFeedIntoStore(parsedSemUm, store1);
console.log("rodada 2:", Object.values(store2.listings).map((l) => `${l.codigoImovel}:${l.status}`));

// Terceira rodada: o imóvel volta a aparecer no feed (ex. erro temporário do feed) -> reativa.
const store3 = mergeFeedIntoStore(parsed, store2);
console.log("rodada 3:", Object.values(store3.listings).map((l) => `${l.codigoImovel}:${l.status}`));
