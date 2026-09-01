/**
 * Sem CRM na v1, o evento de lead no GA4 é a única medição de conversão
 * disponível (ver briefing seção 8). Chamar em: clique no WhatsApp e envio
 * do formulário de contato.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadEvent(
  method: "whatsapp" | "formulario",
  params?: Record<string, string | undefined>
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "generate_lead", { method, ...params });
}
