# Análise do feed VRSync — Lobato & Moraes Imóveis

> Gerado em 31/08/2026, a partir do feed real baixado de:
> `https://www.lobatoemoraesimoveis.com.br/feed/vivareal/wg5kjqpfd37ayx6rstnezh9ci102490_www.fernandomoraesimoveis.com.br.xml`
> Cópia local: `docs/feed-raw.xml` (107 KB) · amostra de um `<Listing>` completo: `docs/sample-listing.xml`

## Resumo executivo

O feed é válido, bem-formado e **codificado em UTF-8 puro, sem mojibake** — o problema de encoding do site atual (item 1.4 do `sitenovo.md`) **não existe no feed**, é um defeito só do template de renderização do site atual. Ótima notícia: o site novo não herda esse defeito automaticamente, só precisa não introduzir um novo.

Mas duas suposições do briefing não se confirmam nos dados reais e mudam o desenho do parser e da v1:

1. **Não há corretor por imóvel no feed.** `ContactInfo` é sempre a imobiliária, nunca um corretor individual.
2. **Não há campo de condomínio nem de garantia (`Warranties`) em nenhum dos 11 imóveis.** O nome do condomínio, quando existe, está embutido em texto livre dentro de `Description`.

Ambos afetam diretamente escopo da v1 (seção 7 do prompt) e merecem decisão sua antes da Etapa 2.

## 1. Volume e cobertura

- **11 imóveis no feed total** — 8 à venda, 3 para locação.
- **Uma única cidade: Taubaté.** Nenhum imóvel em Tremembé, Caçapava, Campos do Jordão ou Santo Antônio do Pinhal aparece no feed, apesar de o `sitenovo.md` (1.3, 1.5) tratar essas cidades como parte da cobertura geográfica atual.
- **7 bairros distintos:** Centro, Chácaras Cataguá, Distrito Industrial do Una II, Jardim Marajoara, Jardim das Nações, Loteamento Residencial e Comercial Bosque Flamboyant, Residencial Novo Horizonte.

⚠️ **Isto muda a escala do projeto.** O briefing fala em "200+ páginas geradas do feed" e em páginas de bairro/condomínio "só onde há estoque real" — com 11 imóveis em 7 bairros, o estoque real hoje sustenta poucas páginas de bairro e talvez nenhuma de condomínio com volume suficiente (a v1 do prompt já prevê isso: "só onde há estoque real"). Não é um problema do parser, é um dado para calibrar expectativa: o site pode ficar com aparência "vazia" se a arquitetura for dimensionada para 200+ imóveis. Vale confirmar com você se este feed reflete a carteira completa atual ou se é uma amostra/exportação parcial.

## 2. Encoding — resolvido, ao contrário do que o site atual sugeria

Testei os dois indicadores citados no `sitenovo.md` (padrão `EspÃ­rito`/`Ã§Ã£o` de UTF-8 servido como Latin-1, e o padrão inverso de Latin-1 servido como UTF-8): **nenhum dos dois aparece**. `file` identifica o arquivo como "UTF-8 text" e a acentuação em `Description`, `Title`, `Neighborhood` etc. está correta (`"Taubaté"`, `"Jardim das Nações"`, `"área de serviço"`, `"3 dormitórios (sendo 1 suíte)"`).

**Ação para o pipeline:** ler o XML explicitamente como UTF-8 (não deixar o parser inferir), e ainda assim validar a acentuação pós-parse como está previsto no prompt (seção 12, Etapa 7) — o feed pode mudar de forma sem aviso, já que é gerado por terceiro.

## 3. Estrutura real observada

Todos os elementos que aparecem no feed (ordem alfabética, extraídos programaticamente do XML inteiro):

```
Address, Bathrooms, Bedrooms, City, Complement, ContactInfo, ContactName,
Country, Description, DetailViewUrl, Details, Email, Feature, Features,
Garage, Header, Iptu, Item, Latitude, ListPrice, Listing, ListingDataFeed,
ListingID, Listings, LivingArea, Location, Logo, Longitude, LotArea, Media,
Name, Neighborhood, OfficeName, PostalCode, PropertyAdministrationFee,
PropertyType, Provider, PublicationType, PublishDate, RentalPrice, State,
StreetNumber, Suites, Telephone, Title, TransactionType, UnitFloor,
UsageType, Website, YearBuilt, YearlyTax
```

**Elementos do schema VRSync oficial que o prompt previa e que NÃO aparecem em nenhum dos 11 imóveis:**
- `Warranties` (0 ocorrências)
- `Floors` / `Buildings` (0 ocorrências — só `UnitFloor` aparece, e só em 1 imóvel)

Isso não significa que o schema não suporte — significa que **a ImobiBrasil não está preenchendo esses campos para esta carteira hoje**, ou o CRM não os captura.

## 4. Condomínio — não é campo estruturado

Confirmando a suspeita do `sitenovo.md` (2.3): **não existe elemento para condomínio no VRSync**, e a ImobiBrasil **não usa nenhum campo custom para isso neste feed**. O nome do condomínio, quando existe, está apenas dentro do texto corrido de `Description`, sem marcação:

> *"O apartamento está em um dos condomínios mais procurados da região, **o Residencial Parque das Nações**, conhecido pelo alto nível de liquidez..."*

Não há padrão consistente de como o nome aparece (às vezes no meio do parágrafo, sem delimitador). Extrair isso via regex é frágil e vai falhar silenciosamente em muitos casos.

**Decisão necessária para a v1/v2** (o prompt já previa isso como ponto de extensão, seção 7): as páginas de condomínio (item 12 da Fase 2) **não podem ser alimentadas automaticamente pelo feed**. Duas opções, não excludentes:
- Manter uma tabela de mapeamento manual `ListingID → condomínio` (o Plano B que o `sitenovo.md` já cogitava em 2.3 — raspar o site atual antes do cutover, ou simplesmente cadastrar à mão dado o volume baixo: só 11 imóveis).
- Tentar extração heurística de `Description` como sinal auxiliar, nunca como fonte única.

## 5. Corretor por imóvel — não existe no feed

`ContactInfo` de **todos os 11 imóveis** é idêntico e genérico:

```xml
<ContactInfo>
  <Name><![CDATA[Lobato & Moraes Imóveis]]></Name>
  <OfficeName><![CDATA[Lobato & Moraes Imóveis]]></OfficeName>
  <Email>contato@lobatoemoraesimoveis.com.br</Email>
  <Telephone>(12) 98166-0001</Telephone>
  <Website>https://www.lobatoemoraesimoveis.com.br</Website>
</ContactInfo>
```

Nenhum nome de corretor individual, CRECI ou telefone diferente por imóvel. Isso é diferente do que a página do imóvel no site atual mostra (que exibe "Dogmar Lobato, CRECI 137573-F" — ver `sitenovo.md` 2.3) — ou seja, **esse dado existe no CRM e é mostrado no site atual, mas não é exportado no feed XML**.

**Impacto direto na seção 8 do prompt** ("Número do corretor responsável pelo imóvel, com fallback para o da imobiliária"): sem esse dado no feed, **a v1 não tem como rotear o WhatsApp por corretor automaticamente** a partir do XML. Opções:
- v1 usa sempre o número da imobiliária (o fallback vira a regra, não a exceção) — mais simples, zero dependência extra.
- Manter uma tabela manual `ListingID → corretor` como a do condomínio (mesmo mecanismo, mesmo esforço, já que o volume é de 11 imóveis).
- Perguntar à ImobiBrasil se dá para incluir o corretor responsável no feed (like ela inclui no HTML do site atual).

Recomendo a primeira opção para a v1 (fallback vira regra) e revisitar quando o volume de imóveis justificar o esforço de tabela manual.

## 6. Erro de cadastro confirmado no feed real (mesma classe do item 1.6 do sitenovo.md)

`APVE050_2-4296705`: o prefixo do código interno (`APVE` = Apartamento Venda) e o `ListPrice`/estrutura de preço sugerem venda, mas:
- `TransactionType` = `For Rent`
- A URL (`DetailViewUrl`) do próprio feed é `.../apartamento-locacao-taubate-sp-...`

É o mesmo padrão de inconsistência já documentado para `APLOC031` (título dizendo "Venda" num imóvel de locação). Aqui é o inverso: código interno de venda, mas o imóvel está publicado como locação. **Recomendo reportar ao Fernando/Lobato para correção no CRM antes do cutover**, junto com os outros três já catalogados.

## 7. Latitude/Longitude — inconsistentes, alguns fora do Brasil

Os valores de `Latitude` e `Longitude` estão **trocados** nos 6 imóveis mais confiáveis do lote (ex.: `Latitude=-45.578...`, `Longitude=-23.026...` — no Brasil, latitude fica perto de -23 e longitude perto de -45, ou seja, os campos estão invertidos). Mas em **3 dos 11 imóveis** os valores não são sequer uma troca simples — caem fora da faixa geográfica do Brasil inteiro (ex. `Latitude=-75.69`, `Longitude=-4.81`), indicando geocodificação com falha na origem, não só campo trocado.

**Ação no parser:** não usar lat/long do feed diretamente no `geo` do schema JSON-LD sem validação. Sugiro: (a) detectar e corrigir a troca de eixo automaticamente quando o padrão for claro (lat negativa grande / long negativa pequena, valores fora de faixa para SP), (b) para os que caem fora de qualquer faixa plausível do Vale do Paraíba, cair para geocodificação pelo endereço (CEP + logradouro) em vez de usar o valor do feed, ou omitir `geo` daquele imóvel em vez de publicar coordenada errada.

## 8. Description — confirma as regras do prompt

- Vem em `CDATA`, com entidades HTML codificadas (`&lt;br&gt;`) exatamente como o prompt previa. Precisa decode + sanitização antes de renderizar.
- Texto é redigido em blocos com `<br>` como separador de parágrafo, sem outras tags — sanitização é simples (decode de entidades + normalizar quebras).
- Como já indicado no briefing: o texto é genérico e repetido em estrutura entre os 11 imóveis ("Se você busca... custo-benefício, localização estratégica..."). Confirma a necessidade de conteúdo exclusivo por página (bairro/condomínio/observação do corretor) para não duplicar o que já está no OLX/ZAP/VivaReal.

## 9. Dados que confirmam funcionalidades da v1

- `RentalPrice` + `PropertyAdministrationFee` + `Iptu`, todos com atributo `period`, presentes e consistentes nos 3 imóveis de locação → **o cálculo de "custo total mensal" (item 1 da v1) é viável direto do feed**, sem dado faltante.
- `Features` traz uma lista padronizada em inglês (`Pool`, `Gym`, `Pets Allowed`, `BBQ`, `Elevator` etc.) — precisa de uma tabela de tradução PT-BR para exibição, mas o dado em si é limpo e enumerado (bom para os chips de categoria da v2).
- `ListPrice` + `LivingArea` → R$/m² calculável como no briefing (elemento assinatura, v2).
- `DetailViewUrl` confirma o padrão `/imovel/{id-numérico}/{slug}` já mapeado no `sitenovo.md`, com `{id-numérico}` diferente do `ListingID` completo do feed (que tem o formato `{CÓDIGO-INTERNO}_2-{id-numérico}`, ex. `APVE019_2-3839575`). **Decisão de slug:** usar o `{id-numérico}` (extraído do sufixo do `ListingID` ou direto de `DetailViewUrl`) como base do slug novo, para preservar a URL já indexada — não usar o `ListingID` completo.

## 10. O que NÃO apareceu e não precisa de ação agora

- `PublicationType` = `PREMIUM` em todos os 11 (não parece variar) — provavelmente não é sinal útil.
- `Logo` aparece só no `Header`, não por imóvel.
- Nenhum vídeo em `Media` (`medium="video"`) nesta amostra — o prompt já trata isso como "quando existir", não bloqueante.

---

## Decisões que preciso da sua confirmação antes da Etapa 2

1. **Este feed de 11 imóveis é a carteira real e completa hoje**, ou existe uma exportação maior em outro lugar? Isso muda o dimensionamento de bairros/condomínios da v1.
2. **Corretor por imóvel:** confirmar que a v1 usa sempre o WhatsApp/telefone da imobiliária (não do corretor individual), já que o feed não traz esse dado.
3. **Condomínio:** aceitar que páginas de condomínio na v1 dependem de uma tabela manual pequena (`ListingID → condomínio`), já que são só 11 imóveis — ou prefere que eu tente extração heurística de `Description` como complemento?
4. Confirma que o erro em `APVE050` (venda vs. locação) deve ser reportado para correção no CRM, e a v1 deve **exibir o que o feed diz** (`TransactionType = For Rent`) sem tentar "adivinhar" a partir do código interno?

Nenhuma dessas pendências bloqueia a Etapa 2 (fundação: estrutura de pastas, modelo de dados TypeScript, tokens de design) — só peço confirmação antes de eu fixar o modelo de dados, porque os itens 2 e 3 mudam os campos que o tipo `Listing` do TypeScript vai carregar.
