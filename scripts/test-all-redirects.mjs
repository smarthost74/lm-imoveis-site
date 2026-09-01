import { readFileSync } from "node:fs";

const csv = readFileSync("docs/search-console-lobatoemoraesimoveis-2026-09-01.csv", "utf-8");
const lines = csv.split("\n").filter(Boolean).slice(1);
const urls = lines.map((l) => l.slice(0, l.lastIndexOf(",")).replace(/^"|"$/g, ""));

const BASE = "http://localhost:3000";
const results = { ok: [], erro: [], loop: [] };

for (const url of urls) {
  const path = new URL(url).pathname + new URL(url).search;
  let current = path;
  const chain = [current];
  let status = 0;
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetch(BASE + current, { redirect: "manual" });
    status = res.status;
    if (status >= 300 && status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      current = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      chain.push(current);
      continue;
    }
    break;
  }
  const entry = { original: path, chain, finalStatus: status };
  if (status >= 500 || status === 404) results.erro.push(entry);
  else if (chain.length > 5) results.loop.push(entry);
  else results.ok.push(entry);
}

console.log(`Total testado: ${urls.length}`);
console.log(`OK (200 ou redirect resolvido): ${results.ok.length}`);
console.log(`Erros (404/500): ${results.erro.length}`);
console.log(`Possível loop: ${results.loop.length}`);

if (results.erro.length) {
  console.log("\n=== ERROS ===");
  for (const e of results.erro) console.log(e.finalStatus, e.original, "->", e.chain.join(" -> "));
}
if (results.loop.length) {
  console.log("\n=== LOOPS ===");
  for (const e of results.loop) console.log(e.chain.join(" -> "));
}

// Distribuição de saltos
const hops = {};
for (const e of results.ok) {
  const n = e.chain.length - 1;
  hops[n] = (hops[n] || 0) + 1;
}
console.log("\nDistribuição de saltos de redirect:", hops);
