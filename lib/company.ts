/**
 * Dados institucionais (NAP + redes) — fonte única usada pelo rodapé, pelo
 * Schema JSON-LD (Etapa 6) e por qualquer outro lugar que precise. Ver
 * briefing seção 6.
 */
export const COMPANY = {
  nome: "Lobato & Moraes Imóveis",
  cnpj: "62.744.189/0001-84",
  creci: "51865-J",
  endereco: {
    logradouro: "Avenida Itália, 928 — Sala 609",
    bairro: "Jardim das Nações",
    cidade: "Taubaté",
    uf: "SP",
    cep: "12030-212",
  },
  telefoneExibicao: "(12) 98166-0001",
  whatsapp: "5512981660001",
  emailLeads: "leads@lobatoemoraesimoveis.com.br",
  horario: "Segunda a Sexta, 09:00–17:00",
  redesSociais: [
    "https://www.facebook.com/lobatoemoraesimoveis",
    "https://www.instagram.com/lobatoemoraesimoveis",
  ],
  lancamentos: [
    { nome: "Borgo Belluno", url: "https://borgobelluno.com.br", imagem: "/lancamentos/borgo-belluno.jpg" },
    { nome: "Villa Mozart", url: "https://villamozartcamposdojordao.com.br", imagem: "/lancamentos/villa-mozart.jpg" },
  ],
  socios: [
    { nome: "Dogmar Lobato", creci: "137573-F" },
    { nome: "Fernando Moraes", creci: "204673-F" },
  ],
} as const;

/** Base para montar URLs absolutas (mensagens de WhatsApp, JSON-LD). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lobatoemoraesimoveis.com.br";

export function buildWhatsappLink(params: { telefone?: string; mensagem: string }): string {
  const numero = (params.telefone ?? COMPANY.whatsapp).replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(params.mensagem)}`;
}
