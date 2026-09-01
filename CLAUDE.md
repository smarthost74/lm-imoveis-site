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

**Logo oficial:** `public/logo.png`, recortado com `sharp` a partir do
arquivo original em `.../05_Marketing_e_Publicidade/Identidade_Visual/
Logotipo Oficial Sem Fundo PNG.png` (o arquivo original tem uma área
transparente enorme ao redor do texto — `public/logo.png` já vem cortado
para o bounding box real do wordmark "LOBATO & MORAES" em dourado). Não há
versão invertida (branca) com transparência disponível ainda — o rodapé
(fundo navy) usa texto, não a logo, até existir esse arquivo.

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
