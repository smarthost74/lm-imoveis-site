import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/feed/types";
import { formatArea, formatCurrency } from "@/lib/format";
import { extractNumericId } from "@/lib/feed/slug";
import { BedIcon, CarIcon, AreaIcon } from "./icons";

/**
 * Card de imóvel — o componente mais reutilizado do site (centenas de
 * instâncias entre home, listagens, bairro/condomínio, "semelhantes").
 * Precisa suportar: preço de venda ou locação (+ custo mensal), estado
 * "indisponível" (imóvel vendido/alugado, fora do feed) e slot opcional
 * para R$/m² (v2 — não exibido ainda, ver `precoPorM2` em lib/feed/types.ts).
 */
export function ImovelCard({ listing }: { listing: Listing }) {
  const capa = listing.fotos.find((f) => f.isPrimary) ?? listing.fotos[0];
  const href = `/imovel/${extractNumericId(listing.codigoImovel)}/${listing.slug}`;
  const indisponivel = listing.status === "indisponivel";

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-borda bg-white transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-borda">
        {capa ? (
          <Image
            src={capa.localPath ?? capa.sourceUrl}
            alt={`Foto de ${listing.titulo}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : null}

        {indisponivel && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/70">
            <span className="rounded-full bg-white px-4 py-1 text-sm font-medium text-navy">
              {listing.finalidade === "venda" ? "Vendido" : "Alugado"}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-display text-lg text-navy">
          {listing.finalidade === "venda" && listing.precoVenda !== undefined
            ? formatCurrency(listing.precoVenda)
            : listing.custoTotalMensal !== undefined
              ? `${formatCurrency(listing.custoTotalMensal)}/mês`
              : "Consulte o valor"}
        </p>
        {listing.finalidade === "locacao" && listing.precoLocacao !== undefined && (
          <p className="text-xs text-texto-suave">
            aluguel {formatCurrency(listing.precoLocacao)} + condomínio e IPTU
          </p>
        )}

        <p className="mt-2 text-sm text-texto-suave">
          {listing.bairro}, {listing.cidade}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm text-texto-suave">
          <span className="flex items-center gap-1">
            <BedIcon className="h-4 w-4" /> {listing.qtdDormitorios}
          </span>
          <span className="flex items-center gap-1">
            <CarIcon className="h-4 w-4" /> {listing.qtdVagas}
          </span>
          <span className="flex items-center gap-1">
            <AreaIcon className="h-4 w-4" /> {formatArea(listing.areaTotal ?? listing.areaUtil)}
          </span>
        </div>
      </div>
    </Link>
  );
}
