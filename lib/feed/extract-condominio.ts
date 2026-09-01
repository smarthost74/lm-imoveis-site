/**
 * A primeira frase de `Observacao` segue um template fixo da ImobiBrasil:
 *   "{TipoImovel} à venda [no {Bairro}], em {Cidade}, no {Condomínio}, na {Endereco}."
 * (o trecho "no {Bairro}" às vezes vem embutido antes de "em {Cidade}", às
 * vezes ausente). O nome logo antes de ", na {Endereco}" é o candidato a
 * condomínio — MUITO mais confiável que buscar em qualquer lugar do texto
 * livre (ver docs/feed-analysis.md seção 5 para a tentativa anterior, mais
 * fraca). Ainda assim: quando o imóvel não fica em condomínio fechado
 * (ex. casa em bairro aberto), esse mesmo slot repete o nome do Bairro —
 * nesse caso, descartamos o candidato.
 *
 * Continua sendo heurística, não uma extração garantida — usar como
 * sugestão pré-preenchida em content/condominio-overrides.json, nunca
 * publicar página de condomínio sem confirmação humana.
 */
export function extractCondominioCandidate(params: {
  primeiraFraseIntro: string | undefined;
  bairro: string;
}): string | undefined {
  const { primeiraFraseIntro, bairro } = params;
  if (!primeiraFraseIntro) return undefined;

  const matches = [...primeiraFraseIntro.matchAll(/,?\s*no\s+([^,]+?),\s*na\s+/gi)];
  if (!matches.length) return undefined;

  const candidate = matches[matches.length - 1][1].trim();
  if (candidate.toLowerCase() === bairro.trim().toLowerCase()) return undefined;

  return candidate;
}
