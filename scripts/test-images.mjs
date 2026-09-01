import { readFileSync } from "node:fs";
import { parseCargaXml } from "../lib/feed/parser.ts";
import { ensureListingImages } from "../lib/feed/images.ts";

const xml = readFileSync("docs/feed-carga-raw.xml", "utf-8");
const parsed = parseCargaXml(xml);

const listing = { ...parsed.listings[0], fotos: parsed.listings[0].fotos.slice(0, 2) };
console.log("baixando 2 fotos de", listing.codigoImovel, "...");
const result = await ensureListingImages(listing);
console.log(result.fotos);
