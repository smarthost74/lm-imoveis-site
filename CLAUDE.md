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
- **Sem campo de condomínio no feed.** Extração heurística de `Observacao`/
  `TituloImovel` acerta ~57–70% — não confiável como fonte única. v1 usa
  `content/condominio-overrides.json`, tabela manual pré-preenchida com as
  sugestões heurísticas, **não confirmadas** (`"confirmado": false`) até
  revisão humana. Nenhuma página de condomínio deve ser gerada a partir de
  uma entrada não confirmada.
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
    types.ts              modelo de dados TypeScript do feed Carga
    characteristics-map.ts dicionário tag -> {label, grupo}
    parser.ts              (Etapa 3) parser do XML -> ParsedFeed
    sanitize-description.ts (Etapa 3) split/limpeza de Observacao
  format.ts               formatação de moeda/área, cálculo de custo mensal
content/
  condominio-overrides.json  tabela manual CodigoImovel -> condomínio
components/               (Etapa 4) os 8 componentes do design system
scripts/
  analyze-feed.mjs        script de análise usado na Etapa 1 (não é pipeline)
  fetch-feed.mjs          (Etapa 3) job diário: baixa feed, cai para cache se falhar
docs/
  feed-analysis.md        relatório de validação do feed (Etapa 1)
  feed-carga-raw.xml      cópia local do feed real baixado em 01/09/2026
  sample-imovel-carga.xml um <Imovel> completo, para referência de schema
.claude/launch.json       config do dev server para o preview do Claude Code
```

## Segurança

- Credenciais/URLs com token (`FEED_CARGA_URL`) sempre em variável de
  ambiente — nunca hardcoded, nunca commitado. `.env.example` documenta as
  chaves esperadas sem valores reais.
- `.gitignore` cobre `.env*`, `node_modules`, `.next`, `out`, cache de
  imagens (`/public/imoveis-cache/`, path reservado para a Etapa 3).
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
  expirado no momento da análise do feed. O usuário confirmou que já está
  sendo resolvido — não é uma pendência deste projeto, só não usar isso como
  sinal de que o pipeline de download está quebrado se aparecer de novo.

## Pendências abertas (não bloqueiam trabalho, mas afetam decisões futuras)

1. Confirmar se o catálogo de 8 imóveis é a carteira ativa completa ou se há
   mais estoque fora do feed.
2. Significado de `TipoOferta` (valores 1/2).
3. Confirmar/corrigir as 5 sugestões de condomínio em
   `content/condominio-overrides.json` antes de gerar qualquer página de
   condomínio a partir delas.
4. Sem dado de locação no feed hoje — decidir se a aba "Alugar" da busca fica
   visível vazia (com estado vazio elegante) ou oculta até existir estoque.
