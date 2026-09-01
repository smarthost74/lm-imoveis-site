"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ListingPhoto } from "@/lib/feed/types";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";

/**
 * Galeria em destaque no topo da página de imóvel — a fotografia é o
 * ativo mais forte do site (ver briefing seção 3.1). Grid com a foto
 * principal em destaque + lightbox navegável por teclado (setas e Esc).
 */
export function Gallery({ fotos, tituloImovel }: { fotos: ListingPhoto[]; tituloImovel: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, close, prev, next]);

  if (!fotos.length) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-borda text-texto-suave">
        Sem fotos disponíveis
      </div>
    );
  }

  const [destaque, ...resto] = fotos;

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="relative col-span-1 row-span-2 aspect-[4/3] overflow-hidden rounded-lg sm:col-span-2 sm:aspect-auto"
        >
          <Image
            src={destaque.localPath ?? destaque.sourceUrl}
            alt={`Foto principal de ${tituloImovel}`}
            fill
            priority
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </button>
        {resto.slice(0, 4).map((foto, i) => (
          <button
            key={foto.filename}
            type="button"
            onClick={() => setOpenIndex(i + 1)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <Image
              src={foto.localPath ?? foto.sourceUrl}
              alt={`Foto ${i + 2} de ${tituloImovel}`}
              fill
              sizes="25vw"
              className="object-cover"
            />
            {i === 3 && resto.length > 4 && (
              <span className="absolute inset-0 flex items-center justify-center bg-navy/60 font-medium text-white">
                +{resto.length - 4} fotos
              </span>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de fotos de ${tituloImovel}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 p-4"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar galeria"
            className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute left-2 rounded-full p-2 text-white hover:bg-white/10 sm:left-6"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>

          <div className="relative h-[70vh] w-full max-w-4xl">
            <Image
              src={fotos[openIndex].localPath ?? fotos[openIndex].sourceUrl}
              alt={`Foto ${openIndex + 1} de ${tituloImovel}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Próxima foto"
            className="absolute right-2 rounded-full p-2 text-white hover:bg-white/10 sm:right-6"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>

          <p className="absolute bottom-4 text-sm text-white/80">
            {openIndex + 1} / {fotos.length}
          </p>
        </div>
      )}
    </div>
  );
}
