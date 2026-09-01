# Deploy no cPanel — guia passo a passo

> Escrito em 01/09/2026, contra a stack deste projeto (Next.js 16, Node
> 24.18.0, deploy por Git). **Não testado contra um cPanel real** — o
> `server.js` e o build foram testados localmente (ver seção 3), mas os
> passos de UI do cPanel podem variar um pouco conforme a versão/tema do
> painel da hospedagem. Se algum passo não bater com o que você vê na
> tela, me avise antes de improvisar.

## Antes de começar

- [ ] Confirmar que a hospedagem oferece "Setup Node.js App" (EA4/Passenger) — é o item do menu do cPanel, não confundir com "Terminal" puro.
- [ ] Confirmar acesso SSH ou Git Version Control no cPanel (para o deploy).
- [ ] Ter em mãos os valores reais das variáveis de `.env.example` (a URL do feed com token, a conta de e-mail SMTP, o ID do GA4).
- [ ] Certificado SSL do domínio ativo (o briefing menciona que já foi resolvido — confirme antes de apontar DNS/proxy).

## 1. Criar a aplicação Node.js no cPanel

1. cPanel → **Setup Node.js App** → **Create Application**.
2. **Node.js version**: `24.18.0` (é a única versão validada — ver `package.json` → `engines.node`).
3. **Application mode**: `Production`.
4. **Application root**: o diretório onde o Git vai clonar o projeto (ex. `lobatoemoraesimoveis` ou `apps/site`). **Não** use `public_html` diretamente como root do app Node — normalmente você aponta um subdomínio/domínio para essa pasta via proxy, ou usa a opção de "Application URL" do próprio painel, que cuida disso.
5. **Application URL**: o domínio ou subdomínio de produção (`www.lobatoemoraesimoveis.com.br` ou o que já estiver configurado).
6. **Application startup file**: `server.js` (na raiz do projeto — é o arquivo custom deste repo, necessário porque o Passenger precisa de um arquivo que escute em `process.env.PORT`; `next start` sozinho não é reconhecido pelo Passenger).
7. Salvar. O cPanel cria um ambiente virtual Node isolado para o app.

Neste ponto o cPanel mostra um comando tipo `source /home/usuario/nodevenv/lobatoemoraesimoveis/24/bin/activate` — é o ambiente que você vai usar sempre que rodar `npm`/`node` manualmente por SSH para este app (inclusive no cron job, seção 6).

## 2. Variáveis de ambiente

Na mesma tela do "Setup Node.js App", seção **Environment Variables** — adicionar uma por uma, com os valores reais (nunca commitados no Git):

| Variável | Valor |
|---|---|
| `FEED_CARGA_URL` | URL completa do feed `Carga`, com o token — pegar com a ImobiBrasil/painel do site atual |
| `LEADS_EMAIL_TO` | `leads@lobatoemoraesimoveis.com.br` |
| `LEADS_EMAIL_FROM` | conta de e-mail real do cPanel (ex. `contato@lobatoemoraesimoveis.com.br`) |
| `SMTP_HOST` | normalmente `mail.lobatoemoraesimoveis.com.br` — confirmar em **Email Accounts → Connect Devices** no cPanel |
| `SMTP_PORT` | `587` (STARTTLS) — a tela de "Connect Devices" confirma a porta certa |
| `SMTP_USER` | o endereço de e-mail completo (mesmo valor de `LEADS_EMAIL_FROM` normalmente) |
| `SMTP_PASS` | a senha dessa conta de e-mail |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX`, do Google Analytics |
| `NEXT_PUBLIC_WHATSAPP_IMOBILIARIA` | `5512981660001` (já é o padrão no código, só precisa setar se mudar) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.lobatoemoraesimoveis.com.br` |

**Nunca cole esses valores em um chat comigo ou em qualquer lugar fora do painel do cPanel** — especialmente `FEED_CARGA_URL` (tem token) e `SMTP_PASS`.

`NEXT_PUBLIC_*` precisam estar definidas **antes do build** (o Next.js as embute em tempo de build, não de runtime) — se mudar uma depois, precisa rodar `npm run build` de novo.

## 3. Primeiro deploy (Git)

Duas formas — use a que sua hospedagem oferecer:

### Opção A — cPanel Git Version Control (mais simples)

1. cPanel → **Git™ Version Control** → **Create**.
2. **Clone URL**: a URL do repositório (GitHub/GitLab/etc — precisa ter sido dado push antes, este projeto está só local até agora).
3. **Repository Path**: o mesmo "Application root" do passo 1.
4. Depois de clonado, abrir **Terminal** (cPanel) ou SSH e rodar, dentro do Application Root:

```bash
source /home/usuario/nodevenv/CAMINHO_DO_APP/24/bin/activate   # comando exato que o cPanel mostrou no passo 1
cd ~/CAMINHO_DO_APP
npm install
npm run build
```

5. Voltar em **Setup Node.js App** e clicar **Restart**.

### Opção B — SSH manual (se não tiver Git Version Control)

```bash
ssh usuario@seuservidor
git clone <url-do-repo> caminho/do/app
cd caminho/do/app
source /home/usuario/nodevenv/caminho-do-app/24/bin/activate
npm install
npm run build
```

Depois, no painel, **Setup Node.js App → Restart**.

### Redeploys seguintes

Sempre a mesma sequência depois de um `git pull`:

```bash
source .../nodevenv/.../24/bin/activate
git pull
npm install       # só se package.json mudou
npm run build
```

E clicar **Restart** no painel (ou `touch tmp/restart.txt` dentro do Application Root, se o Passenger dessa hospedagem usar esse convenção — o botão do painel é mais confiável).

## 4. Primeira execução do pipeline do feed

O site depende de `data/listings.json` existir — sem isso, todas as páginas mostram "nenhum imóvel disponível" (degrada graciosamente, mas óbvio que não é o objetivo). Antes de considerar o site no ar:

```bash
source .../nodevenv/.../24/bin/activate
cd caminho/do/app
node --env-file=.env.production scripts/fetch-feed.ts   # ver nota abaixo sobre o .env
```

**Nota sobre variáveis de ambiente no cron/CLI**: as variáveis definidas na UI do "Setup Node.js App" só valem para o processo que o Passenger inicia (o site em si) — **não** ficam automaticamente disponíveis quando você roda `node` manualmente por SSH. Duas opções:
- Criar um arquivo `.env.production` (fora do Git — já coberto pelo `.gitignore`) no Application Root com os mesmos valores, e usar `node --env-file=.env.production scripts/fetch-feed.ts`.
- Ou exportar as variáveis manualmente na sessão SSH antes de rodar o comando.

Confirme que funcionou:
```bash
ls data/                    # deve ter feed-cache.xml e listings.json
ls public/imoveis-cache/    # deve ter uma pasta por imóvel, com fotos .jpeg/.jpg
```

## 5. Cron job do feed (diário)

cPanel → **Cron Jobs** → **Add New Cron Job**.

- **Common Settings**: `Once Per Day` (ajustar o horário — de madrugada é mais seguro, ex. `0 4 * * *`).
- **Command**:

```bash
/home/usuario/nodevenv/caminho-do-app/24/bin/node --env-file=/home/usuario/caminho-do-app/.env.production /home/usuario/caminho-do-app/scripts/fetch-feed.ts >> /home/usuario/caminho-do-app/logs/feed-fetch.log 2>&1
```

Use caminhos **absolutos** para o binário `node` do virtualenv (não `node` genérico — o cron não carrega o `PATH` do seu shell interativo) e para o script. Crie a pasta `logs/` antes (`mkdir -p logs`) para não perder o histórico de execuções — ela também fica fora do Git.

Depois de configurar, espere a primeira execução automática (ou dispare manualmente por SSH) e confira o log.

## 6. Checklist de fumaça pós-deploy

- [ ] `https://www.lobatoemoraesimoveis.com.br/` carrega e mostra imóveis reais (não "nenhum imóvel disponível")
- [ ] Uma página de imóvel individual abre com fotos reais (não os placeholders `/demo/*.svg`)
- [ ] `/sitemap.xml` e `/robots.txt` respondem
- [ ] Testar 2-3 URLs antigas conhecidas (ex. `/imovel/venda/apartamento/taubate/jardim-das-nacoes-427741`) e confirmar que fazem 301 para a URL nova — `curl -I` mostra `HTTP/1.1 308` (ver `docs/redirects-301.md`)
- [ ] Formulário de contato em `/contato` envia e chega o e-mail de verdade (testa o SMTP em produção)
- [ ] Botão de WhatsApp abre o `wa.me` com o número certo
- [ ] GA4 registrando pageview (checar em Tempo Real no painel do GA4)
- [ ] Certificado SSL válido (cadeado no navegador, sem aviso)
- [ ] Rodar o Rich Results Test do Google (`https://search.google.com/test/rich-results`) contra a URL real de um imóvel publicado, agora que existe URL pública para testar de verdade

## 7. Depois do ar: submeter ao Search Console

1. Se ainda não tiver, adicionar `lobatoemoraesimoveis.com.br` como propriedade no Search Console (provavelmente já existe, foi de lá que veio o export usado nos redirects).
2. **Sitemaps** → enviar `sitemap.xml`.
3. Usar a **Inspeção de URL** em algumas páginas-chave (home, um imóvel, uma página de bairro) e pedir indexação.
4. Confirmar depois de alguns dias que as URLs antigas indexadas foram recrawleadas e o Search Console já mostra o redirect (Cobertura → "Página com redirecionamento").

## Observações

- **`app/demo-componentes`** não tem link nenhum no site nem no sitemap, e o `robots.txt` já bloqueia explicitamente — mas por segurança, considere removê-la de produção quando o site estabilizar (é só uma ferramenta de revisão da Etapa 4).
- Se o certificado SSL expirar de novo no futuro (já aconteceu uma vez, ver `CLAUDE.md` → Histórico relevante), o pipeline do feed vai falhar a busca e cair para o cache automaticamente — não é motivo de pânico, mas o certificado em si precisa ser corrigido à parte, o site não resolve isso sozinho.
