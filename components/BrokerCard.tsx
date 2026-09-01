"use client";

import { buildWhatsappLink } from "@/lib/company";
import { trackLeadEvent } from "@/lib/analytics";
import { WhatsappIcon, PhoneIcon } from "./icons";

/**
 * Card do corretor responsável, na página de imóvel — WhatsApp é o CTA
 * primário (visualmente dominante); telefone/e-mail ficam em segundo
 * plano, sem competir pelo clique (ver briefing seção 3.1). v1: sempre a
 * imobiliária, já que o feed não traz corretor por imóvel (ver CLAUDE.md).
 */
export function BrokerCard({
  nome,
  creci,
  telefone,
  whatsapp,
  mensagemWhatsapp,
  sticky = false,
}: {
  nome: string;
  creci?: string;
  telefone: string;
  whatsapp: string;
  mensagemWhatsapp: string;
  sticky?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-borda bg-white p-5 ${sticky ? "lg:sticky lg:top-4" : ""}`}
    >
      <p className="font-display text-lg text-navy">{nome}</p>
      {creci && <p className="text-xs text-texto-suave">CRECI {creci}</p>}

      <a
        href={buildWhatsappLink({ telefone: whatsapp, mensagem: mensagemWhatsapp })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackLeadEvent("whatsapp", { origem: "broker-card" })}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[#25D366] px-4 py-3 font-medium text-white transition-colors hover:brightness-95"
      >
        <WhatsappIcon className="h-5 w-5" />
        Falar no WhatsApp
      </a>

      <a
        href={`tel:${telefone.replace(/\D/g, "")}`}
        className="mt-3 flex items-center justify-center gap-2 text-sm text-texto-suave hover:text-navy"
      >
        <PhoneIcon className="h-4 w-4" />
        {telefone}
      </a>
    </div>
  );
}
