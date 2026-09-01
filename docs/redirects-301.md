# Redirects 301 — domínio atual (lobatoemoraesimoveis.com.br)

> Baseado no export do Search Console (Indexação → Páginas → Indexada),
> 01/09/2026: `docs/search-console-lobatoemoraesimoveis-2026-09-01.csv`
> (370 URLs). Script de análise: `scripts/analyze-search-console.mjs`.
>
> O domínio antigo `fernandomoraesimoveis.com.br` está fora de escopo por
> decisão do usuário (01/09/2026) — este documento cobre só
> `lobatoemoraesimoveis.com.br`.

## Composição real das 370 URLs indexadas

O número parece alto para um catálogo de 8 imóveis — mas não é dado errado,
é reflexo de dois problemas técnicos de SEO na plataforma atual:

- **213 (58%)** têm o prefixo `/mobile/` — a mesma página do desktop,
  indexada como conteúdo duplicado (a plataforma antiga servia um "site
  mobile" separado; o site novo é responsivo, não precisa disso).
- **191 (52%, com sobreposição)** têm querystring de filtro
  (`?finalidade=venda&tipo=apartamento&bairro=0&sui&gar&dor...`) — páginas
  de busca filtrada indexadas como se fossem conteúdo único. Sinal de falta
  de `canonical`/`noindex` na plataforma atual.
- **Só 45 são URLs únicas de fato** (sem `/mobile/`, sem querystring).

A migração resolve os dois problemas de graça: o site novo não tem versão
mobile separada nem gera URL por combinação de filtro.

## Estratégia de implementação

Toda a lógica vive em `lib/routes.ts` (`resolveLegacyImovelPath`) e em
páginas dedicadas sob `app/`, cada uma chamando `permanentRedirect()` do
Next (308 — equivalente a 301 para o Google, preserva o método). **Nenhum
padrão reconhecido cai em 404** — sempre há um fallback topicamente
relevante (cascata: imóvel ainda ativo → bairro com estoque → tipo+finalidade
→ página genérica).

`/imovel/[...legacy]/page.tsx` acumula duas responsabilidades (a página real
de imóvel individual E o resolver de redirects legados) porque o Next.js não
permite uma rota dinâmica nomeada (`[id]`) e um catch-all (`[...legacy]`)
como irmãos no mesmo nível — ver comentário no arquivo.

## Mapeamento por padrão

| Padrão antigo (exemplo) | Contagem no export | Destino | Como |
|---|---|---|---|
| `/imovel/{id}/{slug}` (id ainda no feed) | 25 | mesma URL — sem redirect | render direto |
| `/imovel/{id}/{slug}` (id fora do feed — vendido) | — | bairro extraído do slug, se ativo; senão `/{tipo}-a-venda-em-taubate` | `resolveLegacyImovelPath` |
| `/mobile/imovel/{id}/{slug}` | 50 | `/imovel/{id}/{slug}` canônico (se ativo) ou mesma cascata acima | `app/mobile/imovel/[...legacy]` |
| `/imovel/{finalidade}/{tipo}/{cidade}/{bairro}-{id}` | 47 | `/imoveis/{cidade}/{bairro}` se tiver estoque, senão `/{tipo}-a-venda-em-{cidade}` | `resolveLegacyImovelPath` |
| `/imovel/{finalidade}/{tipo}[/{cidade}]` | 14+13 | `/{tipo}-a-venda-em-{cidade}` ou `-para-alugar-em-` (mesmo tipo sem estoque atual mostra lista vazia, não 404) | idem |
| `/imovel/{finalidade}` | 4 | `/comprar/taubate` ou `/alugar/taubate` | idem |
| `/imovel` (bare, com/sem querystring) | 34 | `/comprar/taubate` | `app/imovel/page.tsx` |
| `/mobile/imovel/*` (todas as variações acima) | 213 total | mesmos destinos, "mobile" ignorado | `app/mobile/imovel/[...legacy]` |
| `/bairro/{cidade}/{bairro}` | 2 | `/imoveis/{cidade}/{bairro}` | `app/bairro/[cidade]/[bairro]` |
| `/mobile/bairro/{cidade}/{bairro}` | 2 | idem | `app/mobile/bairro/...` |
| `/hs/{slug}-{id}` (hotsite de empreendimento) | 3 | condomínio ativo (`/imoveis/taubate/{slug}`) → lançamento parceiro (URL externa) → `/comprar/taubate` | `app/hs/[slugId]` |
| `/sobre`, `/mobile/sobre` | 2 | `/quem-somos` | — |
| `/pagina/cadastro-de-locatario` | 1 | `/ficha-cadastro` | `app/pagina/[slug]` |
| `/pagina/dados-para-financiamento-caixa` | 1 | `/servicos` (sem simulador CAIXA na v1 — é v3) | idem |
| `/pagina/politica-de-privacidade` | 1 | `/politica-de-privacidade` | idem |
| `/seu-imovel` | 1 | `/contato` (cadastro de imóvel pelo proprietário é v2) | — |
| `/parceiros` | 1 | `/servicos` | — |
| `/noticias`, `/noticias/{slug}` | 3 | `/` (sem blog na v1) | — |
| `/links` | 1 | `/` | — |
| `/contato`, `/politica-de-privacidade` | 2 | mesma URL — sem redirect necessário | — |

## Achado específico

`/hs/villa-mozart-campos-do-jordao-8547` é um dos lançamentos atuais — a
cascata do `/hs/[slugId]` detecta o nome e redireciona direto para
`https://villamozartcamposdojordao.com.br`, preservando o valor de SEO já
acumulado nessa URL.

## Testado localmente (dev, 01/09/2026)

Todos os padrões da tabela testados via `curl` contra o servidor local —
todos retornam `308 Permanent Redirect` para o destino esperado, incluindo
o exemplo citado no próprio briefing (`/imovel/venda/apartamento/taubate/
jardim-das-nacoes-427741` → `/imoveis/taubate/jardim-das-nacoes`, porque
esse bairro tem estoque ativo hoje).

**Observação menor:** URLs com barra final antes da querystring (ex.
`/imovel/?finalidade=venda...`) passam por 2 saltos de redirect (o Next
remove a barra final primeiro, depois nosso redirect roda) — os dois são
308, então não há perda de "SEO juice", só não é o mínimo de saltos
possível. Não vale a complexidade de evitar isso para 191 URLs de baixo
valor individual (filtro de busca).

## Pendências

1. ~~Domínio antigo `fernandomoraesimoveis.com.br`~~ — **fora de escopo**,
   decisão do usuário em 01/09/2026. O projeto trabalha só com
   `lobatoemoraesimoveis.com.br`; esse domínio não será migrado nem
   redirecionado por este site. (A observação de que
   `/empreendimento/{slug}/{uf}/{cidade}/{id}` desse domínio confirmava dado
   de condomínio estruturado no CRM da ImobiBrasil continua uma pista útil
   para uma conversa futura sobre o feed `Carga`, independente disso.)
2. As 3 sugestões de condomínio que ainda não foram confirmadas
   (`content/condominio-overrides.json`) afetam quantos `/hs/*` conseguem
   resolver para uma página de condomínio de verdade em vez do fallback.
