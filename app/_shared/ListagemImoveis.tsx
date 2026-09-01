import Link from "next/link";
import { ImovelCard } from "@/components/ImovelCard";
import type { Listing, Finalidade } from "@/lib/feed/types";
import { getActiveListings } from "@/lib/data";
import { slugify } from "@/lib/feed/slug";

const PAGE_SIZE = 12;

type Ordenacao = "menor-preco" | "maior-preco" | "maior-area" | "mais-recente";

function precoDe(l: Listing): number {
  return l.finalidade === "venda" ? (l.precoVenda ?? 0) : (l.custoTotalMensal ?? l.precoLocacao ?? 0);
}

function ordenar(listings: Listing[], ordenacao: Ordenacao): Listing[] {
  const copia = [...listings];
  switch (ordenacao) {
    case "menor-preco":
      return copia.sort((a, b) => precoDe(a) - precoDe(b));
    case "maior-preco":
      return copia.sort((a, b) => precoDe(b) - precoDe(a));
    case "maior-area":
      return copia.sort((a, b) => (b.areaTotal ?? b.areaUtil) - (a.areaTotal ?? a.areaUtil));
    case "mais-recente":
      return copia.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  }
}

export interface ListagemFiltros {
  cidade: string;
  finalidade: Finalidade;
  /** Restringe a um tipo fixo (páginas /{tipo}-a-venda-em-{cidade}); undefined = qualquer tipo. */
  tipoFixo?: string;
  searchParams: {
    bairro?: string;
    tipo?: string;
    dormitorios?: string;
    ordenar?: string;
    page?: string;
  };
}

export function ListagemImoveis({ cidade, finalidade, tipoFixo, searchParams }: ListagemFiltros) {
  let listings = getActiveListings().filter(
    (l) => l.finalidade === finalidade && slugify(l.cidade) === slugify(cidade)
  );

  if (tipoFixo) {
    listings = listings.filter((l) => slugify(l.tipoImovel) === slugify(tipoFixo));
  } else if (searchParams.tipo) {
    const tipos = searchParams.tipo.split(",").map(slugify);
    listings = listings.filter((l) => tipos.includes(slugify(l.tipoImovel)));
  }

  if (searchParams.bairro) {
    listings = listings.filter((l) => slugify(l.bairro).includes(slugify(searchParams.bairro!)));
  }

  if (searchParams.dormitorios) {
    const min = Number(searchParams.dormitorios);
    if (!Number.isNaN(min)) listings = listings.filter((l) => l.qtdDormitorios >= min);
  }

  const ordenacao = (searchParams.ordenar as Ordenacao) || "mais-recente";
  listings = ordenar(listings, ordenacao);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const totalPaginas = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const pagina = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function buildPageHref(p: number) {
    const params = new URLSearchParams();
    if (searchParams.bairro) params.set("bairro", searchParams.bairro);
    if (searchParams.tipo) params.set("tipo", searchParams.tipo);
    if (searchParams.dormitorios) params.set("dormitorios", searchParams.dormitorios);
    if (searchParams.ordenar) params.set("ordenar", searchParams.ordenar);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  return (
    <div>
      <form className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-borda bg-white p-4">
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Bairro</span>
          <input
            type="text"
            name="bairro"
            defaultValue={searchParams.bairro}
            className="rounded border border-borda px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Dormitórios (mín.)</span>
          <select name="dormitorios" defaultValue={searchParams.dormitorios ?? ""} className="rounded border border-borda px-3 py-2">
            <option value="">Qualquer</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Ordenar por</span>
          <select name="ordenar" defaultValue={ordenacao} className="rounded border border-borda px-3 py-2">
            <option value="mais-recente">Mais recente</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="maior-area">Maior área</option>
          </select>
        </label>
        <button type="submit" className="rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light">
          Filtrar
        </button>
      </form>

      <p className="mb-4 text-sm text-texto-suave">
        {listings.length} {listings.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
      </p>

      {pagina.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagina.map((l) => (
            <ImovelCard key={l.codigoImovel} listing={l} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-borda p-10 text-center text-texto-suave">
          <p className="mb-2 font-display text-lg text-navy">
            Nenhum imóvel {finalidade === "locacao" ? "para alugar" : "à venda"} encontrado com esses filtros no momento.
          </p>
          <p>
            Fale com a gente pelo WhatsApp — nossa carteira muda com frequência e podemos avisar
            quando surgir uma opção.
          </p>
        </div>
      )}

      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageHref(p)}
              className={`rounded px-3 py-1 text-sm ${
                p === page ? "bg-navy text-white" : "border border-borda text-navy hover:border-dourado"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
