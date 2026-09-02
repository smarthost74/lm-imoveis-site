import Script from "next/script";

/**
 * GA4 e Google Ads usam a mesma biblioteca (gtag.js) — carregá-la uma
 * única vez e chamar `gtag('config', ...)` para cada ID configurado,
 * em vez de duas tags de script concorrentes.
 *
 * `NEXT_PUBLIC_GOOGLE_ADS_ID` é só a tag base (remarketing/pageview).
 * Rastrear uma CONVERSÃO específica (ex. envio de formulário) precisa
 * também do "rótulo de conversão" que o Google Ads gera por ação — isso
 * não existe ainda (ver CLAUDE.md pendências). Quando existir, injetar
 * via `trackLeadEvent` (lib/analytics.ts) com `gtag('event', 'conversion',
 * { send_to: 'AW-XXXXXXX/RÓTULO' })`.
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GoogleAnalytics() {
  const ids = [GA4_ID, GOOGLE_ADS_ID].filter((id): id is string => Boolean(id));
  if (!ids.length) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ids[0]}`} strategy="afterInteractive" />
      <Script id="google-tags-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${ids.map((id) => `gtag('config', '${id}');`).join("\n          ")}
        `}
      </Script>
    </>
  );
}
