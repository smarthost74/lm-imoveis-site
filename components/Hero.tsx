import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Hero reutilizado em home, página de bairro e de condomínio (ver
 * CLAUDE.md). Dois layouts:
 * - `overlay` (padrão): uma foto full-bleed com headline sobreposta — usado
 *   em bairro/condomínio, onde o nome do lugar é informação, não marketing.
 * - `split`: banner sem texto, colagem de fotos à direita — usado na home,
 *   com a busca ocupando o lado esquerdo (pedido explícito do usuário,
 *   inspirado no padrão de portal "Chaves na Mão").
 */
interface HeroOverlayProps {
  layout?: "overlay";
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  children?: ReactNode;
  minHeight?: string;
}

interface HeroSplitProps {
  layout: "split";
  photos: { src: string; alt: string }[];
  children?: ReactNode;
}

export function Hero(props: HeroOverlayProps | HeroSplitProps) {
  if (props.layout === "split") {
    const { photos, children } = props;
    const [principal, ...resto] = photos;
    return (
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center bg-navy px-4 py-12 sm:py-16 lg:py-24">
          {children}
        </div>
        <div className="grid h-64 grid-cols-2 gap-1 lg:h-[560px] lg:grid-rows-2">
          {principal && (
            <div className="relative col-span-2 overflow-hidden lg:col-span-1 lg:row-span-2">
              <Image
                src={principal.src}
                alt={principal.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          {resto.slice(0, 2).map((foto, i) => (
            <div key={i} className="relative hidden overflow-hidden lg:block">
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const { imageSrc, imageAlt, eyebrow, headline, subheadline, children, minHeight = "min-h-[520px]" } = props;
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
