import { readFileSync } from "node:fs";
import { sanitizeObservacao } from "../lib/feed/sanitize-description.ts";
import { extractCondominioCandidate } from "../lib/feed/extract-condominio.ts";

const xml = readFileSync("docs/feed-carga-raw.xml", "utf-8");
const blocks = xml.match(/<Imovel>[\s\S]*?<\/Imovel>/g) ?? [];

function getTag(block, tag) {
  const m = block.match(
    new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`)
  );
  return m ? m[1].trim() : null;
}

for (const b of blocks) {
  const cod = getTag(b, "CodigoImovel");
  const obs = getTag(b, "Observacao");
  const bairro = getTag(b, "Bairro");
  const result = sanitizeObservacao(obs);
  const primeiraFrase = result.intro.split("\n\n")[0];
  const condominio = extractCondominioCandidate({ primeiraFraseIntro: primeiraFrase, bairro });
  console.log(cod, "| bairro:", bairro, "| condominio candidato:", condominio ?? "(nenhum)");
}
