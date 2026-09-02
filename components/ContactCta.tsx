"use client";

import { useState, type FormEvent } from "react";
import { buildWhatsappLink } from "@/lib/company";
import { trackLeadEvent } from "@/lib/analytics";
import { WhatsappIcon } from "./icons";

/**
 * Bloco de CTA/contato — botão wa.me (o visitante envia, nunca a API) +
 * formulário que posta para /api/leads (Etapa 6). Honeypot simples contra
 * spam, sem captcha visível. Estados: idle, enviando, sucesso, erro.
 */
export function ContactCta({
  telefone,
  mensagemWhatsapp,
  contexto,
}: {
  telefone?: string;
  mensagemWhatsapp: string;
  /** Ex.: codigoImovel, para identificar a origem do lead no e-mail recebido. */
  contexto?: string;
}) {
  const [status, setStatus] = useState<"idle" | "enviando" | "sucesso" | "erro">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // honeypot: campo invisível que só um bot preencheria
    if (data.get("empresa")) return;

    setStatus("enviando");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.get("nome"),
          telefone: data.get("telefone"),
          email: data.get("email"),
          mensagem: data.get("mensagem"),
          contexto,
        }),
      });
      if (!res.ok) throw new Error("falha no envio");
      setStatus("sucesso");
      trackLeadEvent("formulario", { contexto });
      form.reset();
    } catch {
      setStatus("erro");
    }
  }

  return (
    <div className="rounded-lg border border-borda bg-white p-5">
      <a
        href={buildWhatsappLink({ telefone, mensagem: mensagemWhatsapp })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackLeadEvent("whatsapp", { origem: contexto ?? "contact-cta" })}
        className="flex w-full items-center justify-center gap-2 rounded bg-[#25D366] px-4 py-3 font-medium text-white transition-colors hover:brightness-95"
      >
        <WhatsappIcon className="h-5 w-5" />
        Falar no WhatsApp
      </a>

      <div className="my-4 flex items-center gap-3 text-xs text-texto-suave">
        <span className="h-px flex-1 bg-borda" />
        ou envie uma mensagem
        <span className="h-px flex-1 bg-borda" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="empresa"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Nome</span>
          <input name="nome" required className="rounded border border-borda px-3 py-2 text-base sm:text-sm" />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Telefone</span>
          <input name="telefone" required className="rounded border border-borda px-3 py-2 text-base sm:text-sm" />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">E-mail</span>
          <input type="email" name="email" className="rounded border border-borda px-3 py-2 text-base sm:text-sm" />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Mensagem</span>
          <textarea name="mensagem" rows={3} className="rounded border border-borda px-3 py-2 text-base sm:text-sm" />
        </label>

        <button
          type="submit"
          disabled={status === "enviando"}
          className="rounded bg-navy px-4 py-2 font-medium text-white transition-colors hover:bg-navy-light disabled:opacity-60"
        >
          {status === "enviando" ? "Enviando..." : "Enviar"}
        </button>

        {status === "sucesso" && (
          <p className="text-sm text-green-700" role="status">
            Mensagem enviada! Retornamos em breve.
          </p>
        )}
        {status === "erro" && (
          <p className="text-sm text-red-700" role="alert">
            Não foi possível enviar agora. Tente pelo WhatsApp acima.
          </p>
        )}
      </form>
    </div>
  );
}
