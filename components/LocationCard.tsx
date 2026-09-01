import Image from "next/image";
import Link from "next/link";

/**
 * Card de localidade (bairro ou condomínio), com foto — o padrão copiado
 * do VivaReal que preenche a seção hoje vazia no site atual (ver
 * CLAUDE.md). Usado tanto para bairro quanto para condomínio; o nome do
 * tipo aparece como rótulo pequeno para diferenciar visualmente.
 */
export function LocationCard({
  nome,
  cidade,
  imageSrc,
  imageAlt,
  href,
  totalImoveis,
  tipo = "bairro",
}: {
  nome: string;
  cidade: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  totalImoveis: number;
  tipo?: "bairro" | "condominio";
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-borda bg-white transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-borda">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-navy">
          {tipo === "bairro" ? "Bairro" : "Condomínio"}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-lg text-white">{nome}</p>
          <p className="text-sm text-white/85">{cidade}</p>
        </div>
      </div>
      <div className="p-3 text-sm text-texto-suave">
        {totalImoveis} {totalImoveis === 1 ? "imóvel disponível" : "imóveis disponíveis"}
      </div>
    </Link>
  );
}
