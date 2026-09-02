# Lobato & Moraes Imóveis — site novo

Migração (não site novo do zero) do site institucional da imobiliária, de uma
plataforma SaaS (ImobiBrasil) para Next.js auto-hospedado. **Meta única e
mensurável: ser o site nº 1 do Google para buscas imobiliárias em Taubaté.**
Preservar a autoridade de SEO já indexada é requisito, não detalhe.

Briefing completo original em
`C:\Users\ferna\OneDrive\Documentos\01 - LM Imóveis\Site_Novo\sitenovo.md`
— este arquivo consolida as decisões vivas; o briefing tem o racional completo.

## Como trabalhar aqui

- Vamos por etapas (1 Validação do feed → 2 Fundação → 3 Pipeline → 4
  Componentes → 5 Páginas → 6 SEO técnico → 7 Revisão pré-cutover). Não
  avançar de etapa sem aval explícito do usuário quando a etapa tiver decisão
  em aberto — mas não travar em detalhes menores; ver seção "Auto mode" da
  sessão.
- **v1 é o escopo inteiro por enquanto.** Não implementar nada de v2/v3 (ver
  seção "Escopo" abaixo) — só deixar pontos de extensão preparados no modelo
  de dados.
- Se algo no briefing conflitar com o que for encontrado no código/feed real,
  reportar — não contornar silenciosamente. Já aconteceu uma vez (ver
  Histórico).
- Commits pequenos e descritivos. Nunca commitar `.env*` nem qualquer token.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript, React 19 |
| Estilo | Tailwind CSS v4 (tokens via `@theme inline` em `app/globals.css`, sem `tailwind.config.ts`). **Sem shadcn, Material ou qualquer kit de UI pesado** |
| Encoding | UTF-8 em todo o stack |
| Dados | Feed XML `Carga` da ImobiBrasil, schema próprio (raiz `<Carga>`) — **não é VRSync/VivaReal** |
| Hospedagem produção | cPanel compartilhado (SmartHost), Node.js via "Setup Node.js App" (Passenger) |
| Node.js | **24.18.0** em produção (`package.json` engines: `"24.x"` — a máquina de dev roda 24.16.0, sem 24.18.0 disponível localmente) |
| Analytics | GA4 + Google Search Console (ainda não integrado) |

## Identidade visual (fechada, não redesenhar)

```
Navy    #1B2A4A   var(--color-navy)
Dourado #C9A84C   var(--color-dourado)
Creme   #F5F2EA   var(--color-creme)  (fundo)
```
Tipografia: **Playfair Display** (títulos, `font-display`) + **DM Sans**
(corpo, `font-sans`), carregadas via `next/font/google` em `app/layout.tsx`
(não CDN externo). Tokens completos em `app/globals.css`.

Princípios de design — sistema de **8 componentes**, não desenho de página a
página (o site terá 200+ páginas geradas do feed, quando o catálogo crescer):
1. Card de imóvel · 2. Barra de busca · 3. Hero · 4. Card de bairro/condomínio
· 5. Galeria de fotos · 6. Bloco de CTA/contato · 7. Card de corretor · 8.
Cabeçalho + rodapé (NAP completo no rodapé).

Referência de **interação** (não de posicionamento/estética): vivareal.com.br.
Copiar: busca em abas Comprar/Alugar, tipo em multi-seleção, cards de
localidade com foto, chips de categoria, buscas populares em grid, rodapé em
colunas por intenção. **Não copiar:** mega-menu, criar conta/login, banners
promocionais, grid infinito, densidade visual de portal — aqui a carteira é
curada, não um marketplace de volume.

Piso não negociável: mobile-first, foco de teclado visível (`:focus-visible`
já em `globals.css`), `prefers-reduced-motion` respeitado (já tratado em
`globals.css`), contraste adequado, `alt` descritivo em toda imagem.

**Logo oficial:** `public/logo.png` — lockup completo (losango branco +
"LOBATO & MORAES" dourado + "IMÓVEIS" branco), fundo transparente. **Não
veio da pasta `Identidade_Visual`** — os arquivos "Logotipo Oficial ..."
de lá são só o wordmark em texto, sem o losango, e não são a marca usada
de verdade hoje. A marca real (a mesma que aparece como marca d'água em
toda foto de imóvel do feed) estava dentro de `Placa ALUGA.pdf`, na mesma
pasta. Extraído em 01/09/2026 via `pdftoppm` (600dpi) + `sharp`: recortado
o bloco do logo, removido o texto "CRECI 51865-J" que vinha junto
(específico da placa física), chroma-key da cor navy para transparência.
`app/icon.png`/`app/apple-icon.png` usam só o losango (recorte quadrado) —
favicon bem mais legível que a tentativa anterior com o wordmark inteiro
espremido em 16-32px. Usado no header e no footer (os dois já são
`bg-navy`, então a transparência compõe sem costura).

Se precisar regenerar esses assets, o processo é: `pdftoppm -png -r 600
"Placa ALUGA.pdf"` → localizar o bloco do logo por amostragem de pixel
(região navy sólida no canto superior esquerdo) → cobrir o texto CRECI
com um retângulo da cor de fundo → chroma-key navy→transparente para a
versão do header/footer → recorte quadrado do losango sozinho para favicon.
Não existe (ainda) um SVG vetorial da marca — se o usuário conseguir um,
prefira sempre a fonte vetorial a re-extrair do PDF da placa.

## Os 8 componentes (Etapa 4 — concluída)

Todos em `components/`, Tailwind puro (sem lib de UI), ícones em SVG inline
(`components/icons.tsx`, sem lib de ícones). `app/demo-componentes/page.tsx`
reúne os 8 juntos para revisão visual (lê `data/listings.json` se existir;
não faz parte do site público, não linkar de lugar nenhum).

1. **`ImovelCard`** — estados: normal, "indisponível" (overlay "Vendido"),
   hover. Preço muda conforme `finalidade` (venda vs. custo total mensal).
2. **`SearchBar`** (client) — abas Comprar/Alugar com faixa de valor própria
   por aba (testado: trocar de aba troca as opções). Tipo em multi-seleção,
   agrupado. Sem dado de locação real ainda — a busca gera a URL mesmo assim,
   a listagem (Etapa 5) mostra estado vazio.
3. **`Hero`** — reutilizável em home/bairro/condomínio via props de
   imagem/headline; slot para a busca sobreposta.
4. **`LocationCard`** — bairro ou condomínio (prop `tipo`), com foto e
   contagem de imóveis.
5. **`Gallery`** (client) — grid + lightbox acessível por teclado (setas
   para navegar, Esc para fechar — testado). Estado "sem fotos".
6. **`ContactCta`** (client) — botão `wa.me` + formulário com honeypot,
   `fetch` para `/api/leads` (rota ainda não existe — Etapa 6). Estados:
   idle/enviando/sucesso/erro.
7. **`BrokerCard`** — WhatsApp como CTA visualmente dominante; telefone em
   segundo plano. `sticky` opcional para a página de imóvel.
8. **`Header`** (client, menu mobile) **+ `Footer`** (NAP completo, testado
   via DOM) — sem mega-menu, sem login, rodapé em colunas por intenção.

`lib/company.ts` centraliza NAP + WhatsApp + redes sociais + sócios — fonte
única para rodapé, componentes e (Etapa 6) o Schema JSON-LD.

### Revisões pós-Etapa 7 (feedback direto do usuário)

A lista acima descreve o estado da Etapa 4. Várias decisões do briefing
original foram revertidas depois, por pedido explícito do usuário durante
a revisão do site já no ar — registradas aqui para não serem
"corrigidas de volta" por engano numa sessão futura:

- **`SearchBar`** não é mais um cartão vertical com abas simples — é
  horizontal, abas no formato de guias do Chrome (a ativa funde com o
  painel de campos abaixo). Só 3 campos: Tipo de Imóvel (select único,
  não mais multi-seleção), Localização (texto livre), Buscar. Dormitórios/
  faixa de valor saíram daqui, viraram filtro da listagem.
- **Banner da home removido.** A home não tem mais Hero/foto de capa —
  vai direto do cabeçalho pra `SearchBar`. `Hero` voltou a ter um único
  layout (`overlay`), continua em uso só em bairro/condomínio.
- **Carrossel na home: permitido, contrariando o briefing original.** O
  briefing proibia carrossel na home para evitar estética de portal — o
  usuário pediu explicitamente o oposto depois de ver o site: os grids de
  "Imóveis em destaque" (à venda / para locação) agora são
  `components/ImovelCarousel.tsx`, scroll horizontal nativo com setas,
  sem autoplay. Não estender esse padrão pra outros grids (bairros,
  condomínios, semelhantes) sem pedido explícito — o usuário pediu só
  para os grids de imóvel da home.
- **Header e Footer**: fundo `bg-navy` (não branco), logo completo
  (losango + wordmark) em vez de texto/wordmark sozinho — ver seção
  "Logo oficial" acima. Ícones de Facebook/Instagram visíveis no
  cabeçalho (desktop e menu mobile) e no rodapé.
- **`ImovelCard`** ganhou selo "Venda"/"Locação" sobre a foto e R$/m²
  (venda) abaixo do preço.
- Cores e tipografia: ver seção "Identidade visual" — Navy/Dourado e
  Montserrat/Poppins substituíram os valores do briefing original.

**Nota sobre o Browser pane do Claude Code:** quando o pane está oculto,
`computer screenshot` pode devolver um frame em branco/desatualizado mesmo
com o DOM renderizado corretamente — confirmar via `read_page`/
`get_page_text`/`javascript_tool` antes de assumir bug visual a partir de um
screenshot suspeito.

## Modelo de dados do feed — decisões vivas

Ver `docs/feed-analysis.md` para a validação completa contra o catálogo real
(01/09/2026). Resumo do que muda o código:

- **Feed real:** `https://www.lobatoemoraesimoveis.com.br/feed/portais_personalizados/...xml`
  (token na URL — tratar como segredo, variável `FEED_CARGA_URL` em `.env`,
  nunca no código). Elemento raiz `<Carga data="...">`.
- **Catálogo atual: 8 imóveis**, todos venda, todos em Taubaté. Não há
  locação, não há mais estoque escondido — confirmar periodicamente se isso
  muda (afeta diretamente quantas páginas de bairro/condomínio fazem sentido
  publicar sem ficarem "rasas").
- **Sem `Latitude`/`Longitude` no feed.** Mapa e `geo` do JSON-LD dependem de
  geocodificação por endereço (CEP + logradouro), a implementar na Etapa 3.
- **Sem corretor por imóvel no feed.** v1: WhatsApp/telefone sempre da
  imobiliária (fallback vira regra). Campo `corretor` no tipo `Listing`
  já existe como ponto de extensão para quando/se isso mudar.
- **Sem campo de condomínio no feed.** A Etapa 1 tentou extração heurística
  genérica em `Observacao`/`TituloImovel` (~57%). A Etapa 3 achou um sinal
  bem mais forte: a primeira frase de `Observacao` segue um template fixo
  da ImobiBrasil (`"{Tipo} à venda ..., no {Bairro}, no {Condomínio}, na
  {Endereco}."`) — `lib/feed/extract-condominio.ts` extrai daí e acerta 6 de
  7 imóveis com texto (a casa em bairro aberto corretamente não tem
  candidato). Ainda assim é heurística, não garantia. v1 usa
  `content/condominio-overrides.json`, tabela pré-preenchida com esses
  candidatos, **não confirmados** (`"confirmado": false`) até revisão
  humana — `getConfirmedCondominio()` só retorna o nome quando `confirmado:
  true`. Nenhuma página de condomínio deve ser gerada a partir de uma
  entrada não confirmada.
- **`TipoOferta` (valores 1/2 observados): significado não confirmado.** Não
  usar em filtro/exibição até esclarecer com a ImobiBrasil ou o CRM. Campo
  preservado como `tipoOfertaRaw` no tipo `Listing`.
- **`Observacao` tem estrutura em blocos, não um corte único:** intro único →
  bloco "Resumo do imóvel:" repetitivo (cortar) → parágrafo sobre
  bairro/condomínio (manter — vira insumo de conteúdo único da página de
  bairro) → "Valor de venda:/Agende sua visita" + segunda lista de
  características repetida (cortar). Ver seção 7 de `docs/feed-analysis.md`.
- Dicionário de características em `lib/feed/characteristics-map.ts` — lista
  **aberta**; o parser da Etapa 3 deve logar (não descartar) tags novas.

## Escopo

**v1 (construir agora, tudo — ver checklist completo no briefing seção 7):**
pipeline do feed, página de imóvel, listagens com filtro, busca em abas
Comprar/Alugar, custo total mensal (locação), páginas de bairro/condomínio
(só onde há estoque real), schema JSON-LD, redirects 301, NAP no rodapé,
captação de lead (WhatsApp `wa.me` + formulário por e-mail), links para
Superlógica, Quem Somos, Lançamentos, páginas legais, sitemap/robots/GA4,
404 customizada.

**v2/v3 (não implementar agora, só preparar extensão no modelo de dados):**
comparáveis/estimativa de valor, R$/m² no card (`precoPorM2` já existe no
tipo), filtro por garantia (`garantiasAceitas` já existe no tipo), cadastro
pelo proprietário, conteúdo jurídico, chips de característica, simuladores,
favoritos, integração Superlógica via API, área do corretor parceiro.

**Proibido em qualquer versão:** enviar WhatsApp automaticamente via API não
oficial (bane o número), reconstruir as áreas financeiras da Superlógica,
qualquer redesenho da identidade visual/paleta.

## Estrutura de pastas

```
app/                      App Router — páginas e rotas (Etapa 5 preenche)
  layout.tsx              fontes (Playfair/DM Sans), metadata base
  globals.css             tokens de design (@theme inline, Tailwind v4)
  page.tsx                home (placeholder até Etapa 5)
lib/
  feed/
    types.ts                 modelo de dados TypeScript do feed Carga
    characteristics-map.ts   dicionário tag -> {label, grupo}
    parser.ts                parseCargaXml(xml) -> ParsedFeed
    sanitize-description.ts  split/limpeza de Observacao em blocos
    extract-condominio.ts    heurística de nome de condomínio (ver acima)
    condominio-overrides.ts  lê content/condominio-overrides.json
    slug.ts                  slugify, extractNumericId, buildListingSlug
    store.ts                 persistência em data/listings.json (upsert + indisponivel)
    images.ts                download/re-hospedagem em public/imoveis-cache
  format.ts                  formatação de moeda/área, cálculo de custo mensal
content/
  condominio-overrides.json  tabela manual CodigoImovel -> condomínio
components/                  (Etapa 4) os 8 componentes do design system
scripts/
  analyze-feed.mjs         script de análise usado na Etapa 1 (não é pipeline)
  fetch-feed.ts            entrypoint do job diário — `node --env-file=.env scripts/fetch-feed.ts`
  test-*.mjs               scripts de verificação manual do pipeline, não é suíte formal de testes
data/                      (gerado, fora do Git) feed-cache.xml + listings.json
docs/
  feed-analysis.md        relatório de validação do feed (Etapa 1)
  feed-carga-raw.xml      cópia local do feed real baixado em 01/09/2026
  sample-imovel-carga.xml um <Imovel> completo, para referência de schema
.claude/launch.json       config do dev server para o preview do Claude Code
```

## Páginas (Etapa 5 — concluída)

`lib/data.ts` é a camada de leitura server-side de `data/listings.json`
(cache por request via `react.cache`) — todas as páginas leem por aqui, não
direto do arquivo. Degrada para "sem imóveis" se o pipeline nunca rodou,
não quebra o build.

Rotas construídas:
- `/` — home completa (hero+busca, chips, destaques, bairros, condomínios,
  serviços, lançamentos, quem somos resumido, buscas populares).
- `/imovel/[id]/[slug]` — `[id]` é o numérico já usado pelo site antigo
  (extraído do sufixo de `CodigoImovel`), preservando a URL indexada.
  Estado "indisponível" chamado explicitamente, nunca 404 quando o imóvel
  já existiu (só 404 se o `id` nunca existiu no store).
- `/comprar/[cidade]`, `/alugar/[cidade]` e `/[tipo]-a-venda-em-[cidade]` /
  `/[tipo]-para-alugar-em-[cidade]` — todas usam `app/_shared/ListagemImoveis.tsx`
  (filtro por bairro/dormitórios, ordenação, paginação clássica). `/comprar`
  e `/alugar` sem cidade redirecionam para `/taubate` (única cidade ativa).
- `/imoveis/[cidade]/[localidade]` — resolve `[localidade]` como bairro OU
  condomínio (mesma forma de URL para os dois, ver briefing); 404 se não
  houver estoque ativo ali (evita página rasa).
- Institucionais: `/quem-somos` (reescrita — empresa, dois sócios, Fernando
  advogado+corretor), `/lancamentos`, `/servicos`, `/contato`,
  `/politica-de-privacidade` (rascunho — **pedir revisão jurídica antes do
  lançamento**, o próprio Fernando é advogado).
- Redirects externos (`redirect()` do Next): `/area-do-locatario`,
  `/area-do-proprietario`, `/segunda-via-boleto` (mesma URL da área do
  locatário), `/ficha-cadastro`.
- `/not-found` customizado com `SearchBar`.

**Bug de ambiente descoberto e contornado:** `next dev` com Turbopack
crashava (`memory allocation ... failed`, panic em Rust) ao compilar
qualquer rota nesta máquina — `next build` (produção, também Turbopack) e
`next dev --webpack` funcionam normalmente. `package.json` → `"dev": "next
dev --webpack"`. Não usar Turbopack no dev aqui até a causa raiz ser
identificada (possível bug do Turbopack nesta combinação de SO/Node); build
de produção não é afetado.

**Cuidado ao gerar título de página (`generateMetadata`):** usar sempre o
nome de exibição resolvido (`resolveCidadeNome()` em `lib/data.ts`, ou o
nome do bairro/condomínio já capitalizado), nunca o slug da URL cru — e
nunca concatenar `" | Lobato & Moraes Imóveis"` manualmente, porque
`app/layout.tsx` já aplica esse sufixo via `title.template`. Os dois bugs
já apareceram uma vez nesta etapa (título "em taubate" e sufixo duplicado)
e foram corrigidos.

## SEO técnico (Etapa 6 — concluída, exceto redirects 301)

- **JSON-LD** (`lib/seo/jsonld.ts`): `RealEstateAgent` em todo layout (NAP +
  `sameAs` com redes sociais e os dois lançamentos), `RealEstateListing` +
  `BreadcrumbList` na página de imóvel. **Sem `geo`** em nenhum schema — o
  feed não tem lat/long e não há geocodificação implementada; não publicar
  coordenada inventada. Retomar quando houver geocodificação por endereço.
  Cuidado já corrigido uma vez: `image` do `RealEstateListing` usa
  `f.localPath` (relativo, precisa de `SITE_URL` na frente) OU `f.sourceUrl`
  (já absoluto do feed) — nunca concatenar `SITE_URL` com `sourceUrl`.
- **Sitemap** (`app/sitemap.ts`) e **robots.txt** (`app/robots.ts`), via API
  nativa do Next — cobrem home, institucionais, todo imóvel ativo, toda
  página de bairro/condomínio com estoque e toda combinação tipo+finalidade+
  cidade realmente presente no catálogo (não gera URL para combinação sem
  imóvel). `/demo-componentes` e `/api/` bloqueados no robots.
- **GA4** (`components/GoogleAnalytics.tsx`): só renderiza script se
  `NEXT_PUBLIC_GA4_MEASUREMENT_ID` estiver configurado. Evento
  `generate_lead` (`lib/analytics.ts` → `trackLeadEvent`) disparado em
  **todo** clique de WhatsApp (header desktop/mobile, card do corretor,
  CTA de contato, botão mobile da página de imóvel via
  `components/WhatsappCtaLink.tsx`) e no envio bem-sucedido do formulário.
- **`/api/leads`** (`app/api/leads/route.ts`): honeypot revalidado no
  servidor, rate limit em memória (5/min por IP — aceitável para instância
  única, reseta a cada restart). Envia e-mail via `nodemailer` usando
  `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`LEADS_EMAIL_FROM` (variáveis novas em
  `.env.example`). **Sem essas variáveis configuradas, a rota loga o lead e
  retorna 503 — nunca finge sucesso.** Testado local: com SMTP vazio, o
  formulário mostra o erro corretamente e sugere o WhatsApp.
- **Redirects 301 do domínio atual: implementados** a partir do export real
  do Search Console (01/09/2026, 370 URLs indexadas — ver
  `docs/redirects-301.md` para o mapeamento completo e
  `docs/search-console-lobatoemoraesimoveis-2026-09-01.csv` para o dado
  bruto). Achado: **58% das URLs indexadas eram só duplicata `/mobile/`** e
  **52% eram querystring de busca filtrada indexada por engano** — só 45
  eram únicas de fato. Tudo em `lib/routes.ts`
  (`resolveLegacyImovelPath`) + páginas dedicadas com `permanentRedirect()`
  (308), nunca 404 para um padrão reconhecido (cascata: imóvel ainda ativo
  → bairro com estoque → tipo+finalidade → fallback genérico).
  `app/imovel/[...legacy]/page.tsx` acumula a página real de imóvel E o
  resolver de legado — Next não permite `[id]` e `[...legacy]` como irmãos
  no mesmo nível de rota.
- **Domínio antigo `fernandomoraesimoveis.com.br`: fora de escopo por
  decisão do usuário (01/09/2026).** Não migrar, não redirecionar — o
  projeto trabalha só com `lobatoemoraesimoveis.com.br`. Se ele continuar
  no ar competindo pelas mesmas buscas (ver briefing seção 5, "Domínio
  antigo"), isso é uma decisão consciente do usuário, não uma pendência
  técnica. A observação sobre `/empreendimento/{slug}/{uf}/{cidade}/{id}`
  (sinal de que a ImobiBrasil já teve dado de condomínio estruturado no
  CRM) continua válida como pista para uma conversa futura com a
  ImobiBrasil sobre o feed `Carga`, independente do que acontecer com esse
  domínio.

## Revisão pré-cutover (Etapa 7 — concluída)

Relatório completo: `docs/etapa-7-revisao-pre-cutover.md`. Rodada contra
build de produção local (`npm run build` + `npm run start`), já que o site
ainda não está publicado — onde a ferramenta real exige URL pública
(PageSpeed Insights, Rich Results Test por URL), usei o equivalente que
aceita `localhost` ou código colado direto.

- **JSON-LD**: validado no validator.schema.org e no Rich Results Test do
  Google. **Achado real corrigido:** `address`/`floorSize`/`numberOfRooms`/
  `numberOfBathroomsTotal` não são propriedades válidas de
  `RealEstateListing` (é um tipo intangível) — schema.org acusava 4 avisos.
  Agora ficam dentro de `about: { "@type": "Apartment" | "House" |
  "Accommodation" }` em `lib/seo/jsonld.ts`. Resultado: 0 erros, 0 avisos
  nos 3 schemas; Google confirmou 1 item válido de `BreadcrumbList`.
- **Core Web Vitals mobile** (Lighthouse lab, não PageSpeed Insights real):
  89/100 em home e imóvel, CLS perfeito (0) nas duas. LCP é o ponto mais
  fraco (3.3–3.7s simulado) mas o elemento de LCP faz sentido em ambas
  (headline do hero / foto principal da galeria) — não mudei código por
  causa disso, métrica de lab em laptop de dev não é confiável o bastante
  para guiar otimização; remedir com PageSpeed Insights real pós-lançamento.
- **Acentuação**: 20 páginas reais baixadas do build de produção, zero
  mojibake, 3.385 caracteres acentuados corretos confirmados (controle
  positivo). Pipeline UTF-8 íntegro do feed até o HTML final.
- **Redirects 301**: testadas as **370 URLs reais** do export do Search
  Console (não amostra) via `scripts/test-all-redirects.mjs`. **Achado
  real corrigido:** `/bairro/taubate/jardim-de-alah` redirecionava
  incondicionalmente para uma página de bairro sem estoque hoje → 404. Um
  301 nunca deve apontar para outro erro. `app/bairro/[cidade]/[bairro]`
  (e a versão `/mobile/`) agora só aponta para `/imoveis/{cidade}/{bairro}`
  quando há estoque ativo, senão cai em `/comprar/{cidade}`. Resultado
  final: 370/370 sem erro, sem loop.

## Pipeline do feed (Etapa 3 — concluída)

`scripts/fetch-feed.ts` é o job diário (agendar no cron do cPanel). Roda
direto via `node` — **não precisa de build nem de `tsx`**: Node 24 executa
TypeScript nativamente (type stripping), por isso todo import relativo entre
arquivos de `lib/feed/*.ts` usa extensão `.ts` explícita (exigência do
resolvedor ESM nativo do Node; o bundler do Next resolve normalmente sem
extensão nos imports do próprio app, então isso não afeta o app).

Fluxo: baixa o XML → se falhar (rede/TLS) ou vier inválido, cai para
`data/feed-cache.xml` (último válido) → parseia → funde no store
(`data/listings.json`; imóvel que sai do feed vira `"indisponivel"`, nunca
é apagado) → baixa/re-hospeda fotos novas em `public/imoveis-cache/`
(idempotente, pula o que já existe) → loga características sem mapeamento
em `characteristics-map.ts`.

Testado ponta a ponta em 01/09/2026 contra o feed real, incluindo o cenário
de falha real (certificado expirado no momento do teste) — o fallback para
cache funcionou como projetado, sem exceção não tratada.

## Deploy (cPanel)

Guia completo em `docs/deploy-cpanel.md` (não testado contra um cPanel
real ainda — só o `server.js` e o build, localmente). Pontos que não são
óbvios: o Passenger do cPanel precisa de um arquivo de entrada que escute
em `process.env.PORT` — `next start` sozinho não serve, por isso existe
`server.js` na raiz (custom server mínimo, `npm run start:cpanel` roda
localmente para testar). Variáveis de ambiente definidas na UI do "Setup
Node.js App" só valem para o processo do site — **não** ficam disponíveis
automaticamente no cron job nem em comandos manuais por SSH (precisa de
`.env.production` separado, fora do Git, ou exportar na sessão).

## Segurança

- Credenciais/URLs com token (`FEED_CARGA_URL`) sempre em variável de
  ambiente — nunca hardcoded, nunca commitado. `.env.example` documenta as
  chaves esperadas sem valores reais.
- `.gitignore` cobre `.env*`, `node_modules`, `.next`, `out`, cache de
  imagens (`/public/imoveis-cache/`) e o store gerado (`/data/`).
- Downloads de feed/imagens em produção via HTTPS; se o certificado do
  domínio de origem expirar de novo, o pipeline deve falhar de forma visível
  (não silenciar o erro de TLS) e cair para o cache.

## Histórico relevante

- Uma sessão anterior baixou e analisou o **feed errado** (formato VRSync, do
  domínio antigo `fernandomoraesimoveis.com.br`) antes do briefing ser
  corrigido para apontar o schema `Carga` real. Isso foi identificado e
  corrigido na Etapa 1 desta sessão — `docs/feed-analysis.md` foi reescrito
  do zero a partir do feed correto. Não usar nenhum arquivo/decisão anterior
  a esse commit como referência de schema.
- Em 01/09/2026 o certificado SSL de `lobatoemoraesimoveis.com.br` estava
  expirado (confirmado de novo às 15:42 UTC do mesmo dia, durante o teste
  ponta a ponta da Etapa 3 — ainda expirado nesse momento). O usuário disse
  que já está sendo resolvido — não é uma pendência deste projeto. Não usar
  isso como sinal de que o pipeline de download está quebrado se o fetch
  falhar de novo; primeiro checar o certificado.

## Pendências abertas (não bloqueiam trabalho, mas afetam decisões futuras)

1. Confirmar se o catálogo de 8 imóveis é a carteira ativa completa ou se há
   mais estoque fora do feed.
2. Significado de `TipoOferta` (valores 1/2).
3. Confirmar/corrigir as 6 sugestões de condomínio em
   `content/condominio-overrides.json` (candidatos mais fortes desde a
   Etapa 3) antes de gerar qualquer página de condomínio a partir delas.
4. Sem dado de locação no feed hoje — decidir se a aba "Alugar" da busca fica
   visível vazia (com estado vazio elegante) ou oculta até existir estoque.
5. ~~Redirects 301 do domínio antigo~~ — **fora de escopo**, decisão do
   usuário em 01/09/2026. Projeto trabalha só com
   `lobatoemoraesimoveis.com.br`.
6. Credenciais de SMTP para o envio de e-mail de leads (`SMTP_HOST` etc. em
   `.env.example`) ainda não configuradas em nenhum ambiente — sem isso,
   `/api/leads` loga o lead mas não envia (retorna 503 de propósito).
7. `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID` e
   `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` ainda não configurados — sem eles, os
   respectivos scripts simplesmente não renderizam (comportamento
   esperado, não é bug; testado com valores fictícios em 01/09/2026,
   confirmado via HTML renderizado que os três aparecem quando
   configurados). Faltam também: (a) o "rótulo de conversão" do Google
   Ads, que é por ação e vem separado do ID da conta — necessário para
   rastrear conversão de verdade, não só pageview/remarketing; (b) decidir
   se além de pageview automático o Facebook Pixel deve disparar
   `ViewContent` por imóvel visto (não implementado ainda).
