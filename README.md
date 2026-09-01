# Lobato & Moraes Imóveis — site novo

Next.js (App Router) + TypeScript + Tailwind CSS v4. Ver [`CLAUDE.md`](./CLAUDE.md)
para as decisões de projeto (stack, identidade visual, modelo de dados do
feed, escopo v1/v2) e [`docs/feed-analysis.md`](./docs/feed-analysis.md) para
a validação do feed contra o catálogo real.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e preencha os valores antes de rodar
qualquer coisa que dependa do feed ou do envio de leads.

## Produção

Deploy via Git no cPanel (Setup Node.js App / Passenger), Node.js 24.18.0.
