/**
 * Sem CRM na v1, o evento de lead é a única medição de conversão
 * disponível (ver briefing seção 8). Chamar em: clique no WhatsApp e envio
 * do formulário de contato. Dispara em cada plataforma configurada
 * (GA4/Google Ads via gtag, Meta via fbq) — as que não tiverem a tag
 * carregada (`window.gtag`/`window.fbq` ausente) são simplesmente
 * ignoradas, sem erro.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackLeadEvent(
  method: "whatsapp" | "formulario",
  params?: Record<string, string | undefined>
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "generate_lead", { method, ...params });
  window.fbq?.("track", "Lead", { method, ...params });
}
