# Etapa 7 — Revisão pré-cutover

> Executada em 01/09/2026 contra build de produção local (`npm run build` +
> `npm run start`), já que o site ainda não está publicado. Onde a
> ferramenta exige URL pública (PageSpeed Insights, Search Console), usei o
> equivalente que roda contra `localhost` ou aceita colar código
> diretamente — anotado em cada seção.

## 1. Schema JSON-LD

Validado nos dois lados: [validator.schema.org](https://validator.schema.org)
(estrutural, contra o schema.org oficial) e o
[Rich Results Test do Google](https://search.google.com/test/rich-results)
(colando o código, já que localhost não é uma URL pública testável).

**Achado real, corrigido:** `address`, `floorSize`, `numberOfRooms` e
`numberOfBathroomsTotal` não são propriedades reconhecidas em
`RealEstateListing` — são propriedades de uma entidade de acomodação
(`Apartment`/`House`), não do "anúncio" em si, que é um tipo intangível
(`Listing`). Gerava 4 avisos. Corrigido em `lib/seo/jsonld.ts`: esses
campos agora ficam dentro de `about: { "@type": "Apartment" | "House" |
"Accommodation", ... }`.

Resultado final, testado na página de imóvel real
(`/imovel/4369235/apartamento-venda-taubate-jardim-das-nacoes`):

| Schema | Erros | Avisos |
|---|---|---|
| `RealEstateAgent` | 0 | 0 |
| `RealEstateListing` | 0 | 0 (era 4) |
| `BreadcrumbList` | 0 | 0 |

Google Rich Results Test confirmou **1 item válido detectado** para
`BreadcrumbList` — elegível para o rich result de breadcrumb na busca.
`RealEstateListing`/`RealEstateAgent` não têm rich result dedicado na
galeria do Google (não é um tipo dos "resultados avançados" padrão) — o
valor deles é semântico/AEO, não um rich snippet visual.

## 2. Core Web Vitals (mobile)

Rodado via Lighthouse CLI (`npx lighthouse`, `--form-factor=mobile
--throttling-method=simulate`) contra o build de produção local — não é o
PageSpeed Insights real (precisa de URL pública e dados de campo/CrUX), mas
é a mesma engine de auditoria em modo lab, com throttling de rede/CPU
simulando 4G.

| Página | Performance | LCP | TBT | CLS |
|---|---|---|---|---|
| Home (`/`) | 89/100 | 3.7s | 110ms | 0 |
| Imóvel (`/imovel/4369235/...`) | 89/100 | 3.3s | 200ms | 0 |

**CLS perfeito nas duas** (sem salto de layout — confirma que os
`aspect-ratio` fixos nos cards/galeria/hero estão funcionando). TBT bom
nas duas. LCP é o ponto mais fraco (score 0.58–0.7, abaixo do ideal de
<2.5s), mas o elemento de LCP em cada página faz sentido:

- Home: o LCP é o `<h1>` do hero — o "atraso de renderização do elemento"
  domina (1.4s simulados), não o carregamento de recurso.
- Imóvel: o LCP é a foto principal da galeria (conteúdo real, correto) —
  aqui o tempo é majoritariamente carregamento de imagem, mais explicável
  pelo throttling simulado do que por um problema de código.

**Não fiz mudança de código por causa disso.** Ambiente de produção real
(cPanel, com hospedagem/rede diferente do laptop de dev, mais o cache do
navegador em visitas repetidas) vai se comportar diferente — melhor medir
de novo com o PageSpeed Insights real assim que o site estiver no ar, e
otimizar então se o número real for ruim. Otimizar contra um número de lab
não confirmado seria trabalho sem garantia de payoff.

## 3. Acentuação (UTF-8 ponta a ponta)

Baixei 20 páginas reais (home, institucionais, listagens, bairro, 7
imóveis diferentes) do build de produção local e testei por dois lados:

- **Negativo:** nenhum padrão de mojibake (`Ã©`, `Â`, `â€`, caractere de
  substituição U+FFFD) em nenhuma das 20 páginas.
- **Positivo (controle):** 3.385 caracteres acentuados/cedilhados
  corretos no total, confirmando que a checagem negativa não é um falso
  negativo por página vazia.

Confirma a garantia da Etapa 1 (feed já vem em UTF-8 limpo) se manteve
íntegra por todo o pipeline até o HTML final.

## 4. Redirects 301 — todas as 370 URLs testadas

Não testei só uma amostra: rodei as **370 URLs do export real do Search
Console** (`scripts/test-all-redirects.mjs`) contra o servidor local,
seguindo a cadeia de redirect até a resposta final.

**Achado real, corrigido:** `/bairro/taubate/jardim-de-alah` (e a mesma
sob `/mobile/`) redirecionava incondicionalmente para
`/imoveis/taubate/jardim-de-alah` — que hoje dá 404, porque esse bairro
não tem estoque ativo no catálogo atual. Um 301 apontando para outro erro
é pior do que não redirecionar. Corrigido em
`app/bairro/[cidade]/[bairro]/page.tsx` (e a versão mobile): só
redireciona para a página de bairro se ela tiver estoque hoje
(`bairroExiste`), senão cai em `/comprar/{cidade}`.

Resultado depois da correção:

```
Total testado: 370
OK (200 ou redirect resolvido): 370
Erros (404/500): 0
Possível loop: 0

Distribuição de saltos de redirect: { '0': 5, '1': 173, '2': 192 }
```

Nenhuma URL indexada quebra. As 192 URLs com 2 saltos são majoritariamente
as com barra final antes da querystring (o Next remove a barra primeiro,
depois nosso redirect roda) — ambos os saltos são 301/308, sem perda de
sinal de SEO, só não é o mínimo de saltos possível (ver
`docs/redirects-301.md`).

## Pendências que continuam de fora desta revisão

- Core Web Vitals **de campo** (dados reais de usuários via CrUX/PageSpeed
  Insights) só existem depois do site estar no ar por tempo suficiente.
- Credenciais de SMTP (`/api/leads`) e `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
  ainda não configuradas em nenhum ambiente (ver CLAUDE.md).
- Confirmação humana das 6 sugestões de condomínio em
  `content/condominio-overrides.json`.
