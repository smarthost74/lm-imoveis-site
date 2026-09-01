import { readFileSync } from "node:fs";

const csv = readFileSync(process.argv[2], "utf-8");
const lines = csv.split("\n").filter(Boolean);
const header = lines[0];
const rows = lines.slice(1);

console.log("Header:", header);
console.log("Total rows:", rows.length);

const urls = rows.map((line) => {
  // URL,data — a URL nunca tem vírgula, o resto da linha após a última vírgula é a data
  const lastComma = line.lastIndexOf(",");
  return line.slice(0, lastComma).replace(/^"|"$/g, "");
});

// Categorize by path pattern
const patterns = new Map();
for (const url of urls) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    path = url;
  }
  const segments = path.split("/").filter(Boolean);
  // normalize: replace segment that looks like an id/slug-with-number at the end
  const key = segments
    .map((seg, i) => {
      if (i === 0) return seg; // keep first segment (tipo de rota) literal
      if (/^\d+$/.test(seg)) return "{id}";
      if (/-\d{4,}$/.test(seg)) return "{slug-id}";
      return "{slug}";
    })
    .join("/");
  const list = patterns.get(key) || [];
  list.push(url);
  patterns.set(key, list);
}

const sorted = [...patterns.entries()].sort((a, b) => b[1].length - a[1].length);
console.log(`\n=== ${sorted.length} padrões distintos ===\n`);
for (const [pattern, list] of sorted) {
  console.log(`[${list.length}x] /${pattern}`);
  console.log(`   ex: ${list[0]}`);
  if (list.length > 1 && list[1]) console.log(`   ex: ${list[1]}`);
}
