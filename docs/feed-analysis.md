# Análise do feed `Carga` — Lobato & Moraes Imóveis

> Gerado em 31/08/2026 (dado do próprio feed) / baixado em 01/09/2026, a partir do feed real:
> `https://www.lobatoemoraesimoveis.com.br/feed/portais_personalizados/2ln76spwq31oyafezghucmbrx102490_www.lobatoemoraesimoveis.com.br.xml`
> Cópia local: `docs/feed-carga-raw.xml` (93 KB, 8 imóveis) · script de análise: `scripts/analyze-feed.mjs` (Node, sem dependências)

## ⚠️ Correção sobre a sessão anterior

Existe um commit anterior neste repositório (`1cd1f44`) com um `docs/feed-analysis.md` baseado no **feed errado**: a URL usada então era `feed/vivareal/...fernandomoraesimoveis.com.br.xml`, formato **VRSync** (schema `ListingDataFeed`), de um domínio antigo (`fernandomoraesimoveis.com.br`), não o domínio de produção atual. Este documento substitui aquele, baseado no feed correto especificado no briefing (elemento raiz `<Carga>`).

Não descartei o arquivo antigo (`docs/feed-raw.xml`, ainda no histórico do Git) — mas ele **não deve ser usado como referência de schema**. Os dois feeds têm formatos, campos e nomenclatura completamente diferentes (ex.: o VRSync tinha `Latitude`/`Longitude`, `RentalPrice`, `Warranties` como possibilidade; o `Carga` real não tem nenhum desses três).

## 🔴 Achado não previsto no briefing: certificado SSL do domínio de produção expirou

Ao tentar baixar o feed por HTTPS, a conexão falhou com `SEC_E_CERT_EXPIRED`. Verificação direta do certificado:

```
subject=CN=lobatoemoraesimoveis.com.br
issuer=Let's Encrypt
notBefore=Jun  3 2026
notAfter=Sep  1 2026 14:00:57 GMT   ← expirou HOJE, poucas horas atrás
```

O feed e as imagens continuam acessíveis (baixei ignorando a verificação do certificado, só para fins de leitura/análise — nenhum dado foi enviado ao site), mas isso significa que **o site em produção hoje está com HTTPS quebrado** para qualquer cliente que valide certificado corretamente (todo navegador). Isso não é uma tarefa da Etapa 1, mas é urgente o suficiente para reportar agora: recomendo verificar com quem administra o cPanel/AutoSSL do domínio atual, independente do cronograma da migração — cada hora com o cadeado quebrado é visitante perdido e sinal negativo para o Google.

## Resumo executivo

O feed é válido, bem-formado, raiz `<Carga>` confirmada, e **UTF-8 realmente limpo** (acentuação correta em `Taubaté`, `Jardim das Nações`, `Área de Serviço` etc. — nenhum mojibake). A estrutura do schema 4 do briefing bate com o arquivo real, com um porém importante:

**O catálogo completo hoje tem exatamente 8 imóveis — os mesmos 8 da amostra do briefing.** Não existe um catálogo maior por trás da amostra: a amostra *é* o catálogo atual inteiro. Isso muda a escala esperada do projeto (ver seção 1).

Respostas às três dúvidas obrigatórias da seção 4:

1. **Locação:** não há nenhum imóvel de locação no feed, nem o campo `PrecoLocacao` aparece em nenhum registro. Todos os 8 imóveis são venda (`PrecoVenda` presente em 100%).
2. **`TipoOferta`:** valores `1` (6 imóveis) e `2` (2 imóveis) — **não correlaciona com venda/locação** (todos são venda) nem com faixa de preço de forma limpa (o imóvel de R$ 1.650.000 tem `TipoOferta=1`, mas o de R$ 1.350.000 tem `TipoOferta=2`). Não consegui inferir o significado a partir dos dados — ver pergunta ao final.
3. **Condomínio:** taxa de extração heurística de `Observacao` = **4 de 7** imóveis com texto (57%; 1 imóvel tem `Observacao` vazia). Ver seção 5 para detalhe e recomendação.

## 1. Volume e cobertura — recalibrar expectativa

- **8 imóveis, todos em Taubaté.** Nenhuma outra cidade aparece.
- **7 apartamentos, 1 casa.** Todos os apartamentos são `Apartamento Padrão` / categoria `Padrão`; a única casa é `Casa Padrão` / categoria `Térrea`.
- **6 bairros distintos**, a maioria com 1 imóvel só: Jardim das Nações (3), Vila das Jabuticabeiras (1), Vila Costa (1), Areão (1), Centro (1), Residencial Novo Horizonte (1).
- **Faixa de preço:** R$ 265.000 a R$ 1.780.000.

⚠️ **Isto muda a escala do projeto de forma significativa.** O briefing menciona "200+ páginas geradas do feed" e pressupõe estoque suficiente para páginas de bairro e condomínio "só onde há estoque real" (seção 5.5: "página rasa... é ignorada"). Com 8 imóveis em 6 bairros (a maioria com 1 único imóvel), **hoje não há estoque real para nenhuma página de bairro além de Jardim das Nações** (3 imóveis), e nenhum bairro tem volume para uma página robusta o suficiente para não ser "rasa" pelos próprios critérios do briefing.

Preciso confirmar com você: **este feed de 8 imóveis é a carteira ativa completa hoje**, ou existe mais estoque que não está sendo exportado (ex.: imóveis em rascunho, sem fotos suficientes, ou de captação recente ainda não publicada)? Isso decide se a arquitetura de bairro/condomínio da v1 é dimensionada para "poucas páginas boas" agora com crescimento esperado, ou se há um problema de publicação a investigar antes.

## 2. Encoding — confirmado limpo, sem ação corretiva necessária

Validado meu próprio parser (Node, leitura explícita como UTF-8) contra os 8 registros: acentuação correta em todos os campos de texto (`TituloImovel`, `Bairro`, `Endereco`, `Observacao`). Nenhum padrão de mojibake (`Ã§Ã£o`, `Ã­`) encontrado. Confirma o item 1 da seção 4 do briefing — a fonte já vem limpa; qualquer corrupção futura será bug do próprio pipeline.

**Um detalhe do template de origem, não do encoding:** em `Observacao`, o cifrão de "R$" aparece cortado ("R 1.780.000", "R 265.000" — falta o `$`). É um defeito da geração de texto da ImobiBrasil (provavelmente o `$` sendo tratado como caractere de template), não um problema de UTF-8. Não reproduzir esse padrão no site novo — usar sempre `PrecoVenda` (numérico) formatado corretamente, nunca o valor textual embutido em `Observacao`.

## 3. Estrutura confirmada — schema `Carga`

Todos os elementos observados nos 8 imóveis (fora de `Fotos`):

```
CodigoImovel, TituloImovel, TipoImovel, SubTipoImovel, CategoriaImovel, UF, Cidade,
Bairro, CEP, Endereco, Numero, PrecoVenda, PrecoCondominio, ValorIPTU, AreaUtil,
AreaTotal, QtdDormitorios, QtdSuites, QtdBanheiros, QtdVagas, QtdSalas, QtdElevador,
TipoOferta, Observacao, Fotos
```

**Campos do briefing que NÃO aparecem em nenhum dos 8 imóveis:** `PrecoLocacao`, `Latitude`, `Longitude`, `Complemento`. Trate como ausentes do schema real até prova em contrário (não apenas ausentes desta amostra) — não há nenhum sinal de que existam para outros tipos de oferta.

**Consequência prática:** sem `Latitude`/`Longitude` no feed, o mapa da página de imóvel (seção 3.1) e o `geo` do `RealEstateListing` (seção 6) **dependem de geocodificação por endereço** (CEP + logradouro), não de coordenada vinda do feed. Isso é diferente do que a análise anterior (baseada no feed errado) presumia — lá havia lat/long, mas com eixos trocados.

`AreaTotal` está ausente em 2 dos 8 imóveis (25%) — parser deve tratar como opcional e cair para `AreaUtil` na exibição quando faltar.

Um imóvel (`APVE056_2-4369119`) tem `Observacao` **vazia** (`<![CDATA[]]>`) — a página de imóvel precisa funcionar sem nenhum texto descritivo, mostrando só as características estruturadas.

Um imóvel (`APVE055_2-4368917`) tem **32 fotos, nenhuma marcada `Principal=1`** — o parser precisa de fallback (usar a primeira foto da lista como capa) para não quebrar o card/galeria.

## 4. Características (tags booleanas) — lista real encontrada

37 tags booleanas distintas observadas com valor `1` nos 8 imóveis (lista aberta, mais devem existir em outros imóveis fora desta amostra):

```
Academia, Agua, ArCondicionado, AreaLazer, AreaServico, Banheira, Blindex, Cerca,
Churrasqueira, ChurrasqueiraVaranda, Closet, Clube, CozinhaAmericana, EnergiaEletrica,
EntradaServicoIndependente, EspacoGourmet, Guarita, Hidromassagem, Interfone, Lavabo,
Luz, MoveisPlanejados, Piscina, Playground, Porcelanato, QuadraPoliEsportiva,
QuadraTenis, Quintal, RedeTelefone, Restaurante, SalaGrande, SalaoFestas, SalaoJogos,
SegurancaInterna, SegurancaRua, TV, Telefone, Varanda, VarandaGourmet
```

Bate com a lista do briefing, com adições: `Agua`, `Clube`, `EnergiaEletrica`, `EntradaServicoIndependente`, `Luz`, `Quintal`, `SalaGrande`, `SegurancaRua`, `TV`. **Confirma que é lista aberta** — o pipeline deve logar qualquer tag nova não mapeada no dicionário, como o briefing já previa, e não descartar silenciosamente.

Vale registrar: `Agua`, `Luz`, `EnergiaEletrica`, `RedeTelefone`, `Telefone` parecem ser infraestrutura básica do lote/terreno (mais relevantes para a casa térrea) — não são amenidades de lazer. O dicionário de mapeamento tag → grupo precisa de uma categoria além de "Lazer do condomínio" / "Segurança" / "Acabamento": algo como **"Infraestrutura do terreno/lote"**.

## 5. Condomínio — extração heurística parcialmente viável, não confiável como fonte única

Testei os padrões sugeridos no briefing contra os 7 imóveis com `Observacao` preenchida:

| Código | Resultado |
|---|---|
| APVE052 | ✅ "Residencial MOB" |
| APVE054 | ❌ não encontrado (mas **o nome já está no `TituloImovel`**: "Condomínio Cyan") |
| APVE055 | ✅ "Village Towers" |
| APVE056 | — (`Observacao` vazia) |
| APVE057 | ✅ "Edifício Europa" |
| APVE058 | ❌ não encontrado |
| CAVE059 | ❌ não encontrado (é a casa térrea — não fica em condomínio fechado com nome próprio, é bairro aberto) |
| APVE061 | ✅ "Edifício Des Arts" |

**Taxa: 4/7 (57%) via `Observacao`.** Mas descobri uma segunda fonte: **o `TituloImovel` às vezes já contém o nome do condomínio** de forma mais estruturada (`"Apartamento 3 Quartos| Venda | Condomínio Cyan | Taubaté"`), inclusive em um caso (APVE054) onde a extração de `Observacao` falhou. Combinando as duas fontes eu chegaria a 5/7, mas ainda não é confiável o bastante para gerar páginas de condomínio automaticamente sem revisão humana — principalmente porque um falso positivo (nome errado extraído) é pior do que não gerar a página.

**Recomendação:** não deixe a extração heurística gerar página de condomínio publicada diretamente. Ela é útil como **sugestão pré-preenchida** numa tabela de mapeamento manual pequena (`CodigoImovel → condomínio`), que você confirma/corrige — com 8 imóveis o esforço manual é de minutos, não de uma feature de parsing. Reavaliar quando o volume justificar investir em extração automática mais robusta (ou, melhor ainda, perguntar à ImobiBrasil se dá para exportar o campo estruturado, já que o domínio antigo tinha páginas de empreendimento funcionando — sinal de que o dado existe no CRM).

## 6. Corretor por imóvel — confirmado ausente, como o briefing já esperava

Não existe nenhum campo de corretor, nome, telefone individual ou CRECI em nenhum dos 8 registros. Confirma a diretriz da seção 4/8 do briefing: v1 usa sempre o WhatsApp único da imobiliária.

## 7. Descrição (`Observacao`) — estrutura mais complexa do que o briefing previa

Confirma: vem em `CDATA`, com `&lt;br&gt;` como quebra de linha, e **realmente repete em texto as mesmas características já estruturadas** — mas a repetição acontece **duas vezes**, não uma, com um trecho valioso no meio que a regra simples do briefing ("corte tudo depois de 'Resumo do imóvel'") apagaria sem querer.

Estrutura real observada, em ordem, nos 7 registros com texto:

1. **Parágrafo intro** — único, específico do imóvel (endereço, condomínio se houver, resumo de metragem/cômodos). **Manter.**
2. **2–3 parágrafos de "venda"** — texto redacional específico (ex. "aqui é casa com terreno próprio e sem taxa de condomínio"). **Manter** — é o conteúdo mais próximo de diferenciação real que o feed oferece.
3. **Marcador `"Resumo do imóvel:"`** seguido de lista com `&lt;br&gt;` repetindo as características estruturadas (dormitórios, banheiros, vagas, m², às vezes condomínio/IPTU em texto). **Cortar.**
4. **Parágrafo sobre o bairro/condomínio** (ex. "O Edifício Europa é condomínio fechado com..."; "O Residencial Novo Horizonte é um bairro residencial consolidado..."). **Conteúdo único e valioso — manter.** É exatamente o tipo de frase que serve de base para a página de bairro/condomínio (seção 5.5 do briefing).
5. **`"Valor de venda: R ...  Agende sua visita com a Lobato Moraes Imóveis..."`** — boilerplate de CTA que o site novo já tem seu próprio bloco de CTA. **Cortar.**
6. **Segunda lista gigante de características**, repetindo de novo tudo (inclusive itens de proximidade tipo "Escola", "Farmácia", "Supermercado" que não são nem tags booleanas do imóvel, mas sim POIs genéricos do bairro). **Cortar.**

**Ação de parser revisada:** não é um corte único a partir de "Resumo do imóvel". É: cortar o bloco 3 (do marcador `"Resumo do imóvel:"` até o próximo parágrafo substantivo), manter o bloco 4, e cortar tudo a partir de `"Valor de venda:"` até o fim. Vou implementar isso como uma função de sanitização com esses dois pontos de corte, testada contra os 7 registros reais antes de generalizar.

## 8. `TipoOferta` — pergunta em aberto, não presumi nada

Distribuição real: `1` em 6 imóveis, `2` em 2 imóveis (`APVE057`, `APVE058` — os dois apartamentos de "alto padrão" citados no próprio texto da `Observacao`, R$ 1.780.000 e R$ 1.350.000). Não é uma correlação limpa de preço (o imóvel de R$ 1.650.000 tem valor `1`). Hipóteses não confirmadas: categoria de destaque/portal, "alto padrão" vs. "padrão" (mas já existe `CategoriaImovel` para isso, que diz "Padrão" nos dois), ou um campo de configuração do corretor sem relação com o imóvel em si. **Preciso que você confirme com a ImobiBrasil ou verifique no painel do CRM o que esse campo significa antes de eu decidir se ele entra em algum filtro ou exibição da v1.**

## 9. `CategoriaImovel` — dado extra não previsto no briefing

Aparece em 100% dos imóveis: `"Padrão"` (7×) ou `"Térrea"` (1×, para a casa). Parece descrever o formato construtivo, não o padrão de acabamento (apesar do nome). Vale mapear no modelo de dados mesmo sem uso definido na v1 — é campo simples de preservar.

## Decisões que preciso da sua confirmação antes da Etapa 2

1. **O feed de 8 imóveis é a carteira ativa completa hoje?** Se sim, a v1 nasce com páginas de bairro/condomínio bem mais restritas do que "200+ páginas" sugere — preciso saber se isso é esperado (carteira vai crescer) ou se há imóveis fora do feed que deveriam estar nele.
2. **Certificado SSL expirado hoje** (`lobatoemoraesimoveis.com.br`) — quer que eu sinalize isso para alguém agir agora, independente da migração, ou você já está ciente/tratando disso em paralelo?
3. **`TipoOferta` (1 vs. 2):** você sabe o que esse campo significa no CRM da ImobiBrasil? Não vou usá-lo em nenhum filtro/exibição até confirmar.
4. **Condomínio:** confirma que a v1 usa uma tabela manual pequena (`CodigoImovel → condomínio`), pré-preenchida com as 5 sugestões heurísticas encontradas (4 de `Observacao` + 1 de `TituloImovel`) para você revisar, em vez de gerar a página automaticamente a partir do texto?
5. Sem nenhum imóvel de locação no feed hoje, **a v1 constrói a UI de aba "Alugar" e o cálculo de custo total mensal mesmo sem dado para popular** (ficam prontos, mas vazios/ocultos até existir estoque), ou adiamos essa aba inteira para quando houver locação real no feed?

Nenhuma dessas pendências bloqueia a Etapa 2 (fundação: estrutura de pastas, modelo de dados TypeScript, tokens de design) — os itens 1, 3 e 4 mudam campos do tipo `Listing`, então prefiro sua confirmação antes de fixá-los.
