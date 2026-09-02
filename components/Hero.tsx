import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Hero com foto full-bleed e headline sobreposta — usado em bairro e
 * condomínio, onde o nome do lugar é informação, não marketing (ver
 * CLAUDE.md). Não é mais usado na home: o banner foi removido a pedido do
 * usuário, a busca agora abre a página direto.
 */
export function Hero({
  imageSrc,
  imageAlt,
  eyebrow,
  headline,
  subheadline,
  children,
  minHeight = "min-h-[520px]",
}: {
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  children?: ReactNode;
  minHeight?: string;
}) {
  return (
    <section className={`relative flex ${minHeight} items-end justify-center overflow-hidden`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-6 px-4 pb-10 text-center sm:pb-16">
        <div>
          {eyebrow && (
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-dourado-light">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl text-white sm:text-4xl md:text-5xl">{headline}</h1>
          {subheadline && <p className="mt-3 text-white/90">{subheadline}</p>}
        </div>

        {children}
      </div>
    </section>
  );
}
