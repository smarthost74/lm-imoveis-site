"use client";

import { useRef } from "react";
import { ImovelCard } from "./ImovelCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import type { Listing } from "@/lib/feed/types";

/**
 * Vitrine em scroll horizontal — pedido explícito do usuário para os
 * grids de imóveis da home (ver CLAUDE.md; o briefing original proibia
 * carrossel na home, esta é uma reversão explícita e consciente dessa
 * regra, não um contorno silencioso). Scroll nativo (funciona por toque/
 * trackpad sem JS), setas são só um atalho de conveniência — sem
 * autoplay, sem rotação automática.
 */
export function ImovelCarousel({ listings }: { listings: Listing[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((l) => (
          <div key={l.codigoImovel} className="w-64 shrink-0 snap-start sm:w-72">
            <ImovelCard listing={l} />
          </div>
        ))}
      </div>

      {listings.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Ver imóveis anteriores"
            className="absolute left-0 top-1/2 hidden -translate-x-3 -translate-y-1/2 rounded-full bg-white p-2 text-navy shadow-md hover:bg-creme sm:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Ver mais imóveis"
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-3 rounded-full bg-white p-2 text-navy shadow-md hover:bg-creme sm:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
