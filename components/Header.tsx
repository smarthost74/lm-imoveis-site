"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { trackLeadEvent } from "@/lib/analytics";
import { PhoneIcon, WhatsappIcon, InstagramIcon, FacebookIcon } from "./icons";

/**
 * Sem mega-menu (só 5 cidades, ficaria vazio/pretensioso — ver CLAUDE.md) e
 * sem "Criar conta"/"Entrar" (sem contas de usuário na v1).
 *
 * Fundo navy = a cor de fundo real do Logotipo Oficial (não um branco
 * genérico) — pedido explícito do usuário, ver CLAUDE.md.
 */
const NAV_ITEMS = [
  { href: "/comprar", label: "Comprar" },
  { href: "/alugar", label: "Alugar" },
  { href: "/lancamentos", label: "Lançamentos" },
  { href: "/servicos", label: "Serviços" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt={COMPANY.nome}
            width={1600}
            height={781}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-white/85 hover:text-dourado-light">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={COMPANY.redesSociais[0]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook da Lobato & Moraes Imóveis"
            className="text-white/85 hover:text-dourado-light"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
          <a
            href={COMPANY.redesSociais[1]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Lobato & Moraes Imóveis"
            className="text-white/85 hover:text-dourado-light"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a href={`tel:${COMPANY.whatsapp}`} className="flex items-center gap-1 text-sm text-white/85 hover:text-dourado-light">
            <PhoneIcon className="h-4 w-4" />
            {COMPANY.telefoneExibicao}
          </a>
          <a
            href={`https://wa.me/${COMPANY.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLeadEvent("whatsapp", { origem: "header" })}
            className="flex items-center gap-2 rounded bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            <WhatsappIcon className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
          aria-label="Abrir menu"
          className="flex flex-col gap-1.5 p-2 lg:hidden"
        >
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
        </button>
      </div>

      {menuAberto && (
        <nav id="menu-mobile" aria-label="Navegação móvel" className="border-t border-navy-light lg:hidden">
          <ul className="flex flex-col p-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className="block py-2 text-white/85 hover:text-dourado-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`https://wa.me/${COMPANY.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLeadEvent("whatsapp", { origem: "header-mobile" })}
                className="mt-2 flex items-center justify-center gap-2 rounded bg-[#25D366] px-3 py-2 font-medium text-white"
              >
                <WhatsappIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </li>
            <li className="mt-4 flex justify-center gap-6">
              <a
                href={COMPANY.redesSociais[0]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Lobato & Moraes Imóveis"
                className="text-white/85 hover:text-dourado-light"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={COMPANY.redesSociais[1]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Lobato & Moraes Imóveis"
                className="text-white/85 hover:text-dourado-light"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
