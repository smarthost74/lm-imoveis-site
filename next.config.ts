import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md é curado manualmente pelo projeto (ver seção "Como trabalhar
  // aqui") — não deixar o Next reescrevê-lo a cada `next dev`.
  agentRules: false,
  images: {
    // SVG local em /public (ex. placeholders de demonstração) — seguro
    // porque são arquivos nossos, não upload de terceiro.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Fallback enquanto uma foto ainda não foi baixada/re-hospedada pelo
    // pipeline diário (lib/feed/images.ts) — em regra as imagens já
    // servidas pelo site usam o caminho local em /public/imoveis-cache.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.lobatoemoraesimoveis.com.br",
        pathname: "/imagens/imoveis/**",
      },
    ],
  },
};

export default nextConfig;
