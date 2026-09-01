import { readFileSync } from 'node:fs';

const xml = readFileSync('docs/feed-carga-raw.xml', 'utf-8');

// Split into individual <Imovel>...</Imovel> blocks (feed is not deeply nested besides Fotos)
const imovelBlocks = xml.match(/<Imovel>[\s\S]*?<\/Imovel>/g) || [];
console.log('Total <Imovel> blocks:', imovelBlocks.length);

function getTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`));
  return m ? m[1].trim() : null;
}

function getTopLevelTags(block) {
  // Remove Fotos sub-block to avoid counting nested Foto fields as top-level
  const withoutFotos = block.replace(/<Fotos>[\s\S]*?<\/Fotos>/, '');
  const tags = new Set();
  const re = /<([A-Za-z0-9_]+)>/g;
  let m;
  while ((m = re.exec(withoutFotos))) tags.add(m[1]);
  return tags;
}

const allTagCounts = {};
const tipoOfertaVals = {};
const tipoImovelVals = {};
const subTipoVals = {};
const categoriaVals = {};
const cidades = {};
const bairros = {};
const codigoPrefixes = {};
let hasPrecoLocacao = 0;
let hasPrecoVenda = 0;
let hasAreaTotal = 0;
let missingAreaTotal = 0;

const booleanFeatureCandidates = new Set();
const knownNonBoolean = new Set([
  'CodigoImovel','TituloImovel','TipoImovel','SubTipoImovel','CategoriaImovel',
  'UF','Cidade','Bairro','CEP','Endereco','Numero','PrecoVenda','PrecoCondominio',
  'ValorIPTU','AreaUtil','AreaTotal','QtdDormitorios','QtdSuites','QtdBanheiros',
  'QtdVagas','QtdSalas','QtdElevador','TipoOferta','Observacao','Fotos','PrecoLocacao',
  'Complemento','Latitude','Longitude'
]);

for (const block of imovelBlocks) {
  const tags = getTopLevelTags(block);
  for (const t of tags) {
    allTagCounts[t] = (allTagCounts[t] || 0) + 1;
    if (!knownNonBoolean.has(t)) {
      const val = getTag(block, t);
      if (val === '1') booleanFeatureCandidates.add(t);
    }
  }
  const to = getTag(block, 'TipoOferta');
  if (to !== null) tipoOfertaVals[to] = (tipoOfertaVals[to] || 0) + 1;
  const ti = getTag(block, 'TipoImovel');
  if (ti !== null) tipoImovelVals[ti] = (tipoImovelVals[ti] || 0) + 1;
  const st = getTag(block, 'SubTipoImovel');
  if (st !== null) subTipoVals[st] = (subTipoVals[st] || 0) + 1;
  const cat = getTag(block, 'CategoriaImovel');
  if (cat !== null) categoriaVals[cat] = (categoriaVals[cat] || 0) + 1;
  const c = getTag(block, 'Cidade');
  if (c !== null) cidades[c] = (cidades[c] || 0) + 1;
  const b = getTag(block, 'Bairro');
  if (b !== null) bairros[b] = (bairros[b] || 0) + 1;
  if (getTag(block, 'PrecoLocacao') !== null) hasPrecoLocacao++;
  if (getTag(block, 'PrecoVenda') !== null) hasPrecoVenda++;
  if (getTag(block, 'AreaTotal') !== null) hasAreaTotal++; else missingAreaTotal++;
  const cod = getTag(block, 'CodigoImovel');
  const prefixMatch = cod ? cod.match(/^([A-Z]+)/) : null;
  if (prefixMatch) {
    const p = prefixMatch[1];
    codigoPrefixes[p] = (codigoPrefixes[p] || 0) + 1;
  }
}

console.log('\n=== Top-level tags found across all imoveis (tag: count of imoveis with it) ===');
for (const [t, c] of Object.entries(allTagCounts).sort()) {
  console.log(`${t}: ${c}`);
}

console.log('\n=== TipoOferta distribution ===', tipoOfertaVals);
console.log('=== TipoImovel distribution ===', tipoImovelVals);
console.log('=== SubTipoImovel distribution ===', subTipoVals);
console.log('=== CategoriaImovel distribution ===', categoriaVals);
console.log('=== Cidades ===', cidades);
console.log('=== Bairros ===', bairros);
console.log('=== Codigo prefixes ===', codigoPrefixes);
console.log('\nhasPrecoLocacao:', hasPrecoLocacao, '/ hasPrecoVenda:', hasPrecoVenda);
console.log('hasAreaTotal:', hasAreaTotal, 'missingAreaTotal:', missingAreaTotal);

console.log('\n=== Boolean-like feature tags (value=1 seen at least once) ===');
console.log([...booleanFeatureCandidates].sort().join(', '));

// Condominium extraction test from Observacao
console.log('\n=== Condominio extraction test from Observacao ===');
let condoFound = 0;
let condoTotal = 0;
for (const block of imovelBlocks) {
  const obs = getTag(block, 'Observacao');
  const cidade = getTag(block, 'Cidade');
  const bairro = getTag(block, 'Bairro');
  const cod = getTag(block, 'CodigoImovel');
  if (!obs) continue;
  condoTotal++;
  // decode basic entities
  const decoded = obs.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  // try patterns from briefing
  const patterns = [
    new RegExp(`no ${escapeRe(cidade)}, no ([^,]+?), na`, 'i'),
    new RegExp(`no ${escapeRe(bairro)}, em ${escapeRe(cidade)}, no ([^,]+?), na`, 'i'),
    /no condom[ií]nio ([^,.<]+)/i,
    /condom[ií]nio\s+fechado\s+([A-ZÀ-Ú][\wÀ-ú' ]+)/,
  ];
  let match = null;
  for (const p of patterns) {
    const m = decoded.match(p);
    if (m) { match = m[1].trim(); break; }
  }
  console.log(`${cod}: ${match ? 'FOUND -> ' + match : 'not found'}`);
  if (match) condoFound++;
}
console.log(`\nCondo extraction rate: ${condoFound}/${condoTotal}`);

function escapeRe(s) {
  return (s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log('\n=== Per-imovel summary ===');
for (const block of imovelBlocks) {
  console.log(
    getTag(block, 'CodigoImovel'),
    '| TipoOferta=', getTag(block, 'TipoOferta'),
    '| Tipo=', getTag(block, 'TipoImovel'),
    '| Categoria=', getTag(block, 'CategoriaImovel'),
    '| PrecoVenda=', getTag(block, 'PrecoVenda'),
    '| Titulo=', getTag(block, 'TituloImovel')
  );
}

console.log('\n=== Full Observacao for imovel index 6 (CAVE059) ===');
console.log(getTag(imovelBlocks[6], 'Observacao'));
console.log('\n=== Full Observacao for imovel index 4 (APVE057) ===');
console.log(getTag(imovelBlocks[4], 'Observacao'));
