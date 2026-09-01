import { readFileSync } from "node:fs";
import { parseCargaXml } from "../lib/feed/parser.ts";

const xml = readFileSync("docs/feed-carga-raw.xml", "utf-8");
const parsed = parseCargaXml(xml);

console.log("metadata:", parsed.metadata);
console.log();
for (const l of parsed.listings) {
  console.log("===", l.codigoImovel, "===");
  console.log("slug:", l.slug);
  console.log("finalidade:", l.finalidade, "| precoVenda:", l.precoVenda, "| custoTotalMensal:", l.custoTotalMensal);
  console.log("condominio:", l.condominio);
  console.log("caracteristicas:", l.caracteristicas);
  console.log("fotos:", l.fotos.length, "primeira principal:", l.fotos.find((f) => f.isPrimary)?.filename);
  console.log("descricaoIntro (100 chars):", l.descricaoIntro.slice(0, 100));
  console.log();
}
