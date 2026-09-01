import Link from "next/link";
import { ImovelCard } from "@/components/ImovelCard";
import type { Listing, Finalidade } from "@/lib/feed/types";
import { getActiveListings } from "@/lib/data";
import { slugify } from "@/lib/feed/slug";
import { CHARACTERISTIC_MAP } from "@/lib/feed/characteristics-map";

const PAGE_SIZE = 12;

type Ordenacao = "menor-preco" | "maior-preco" | "maior-area" | "mais-recente";

/**
 * Preço de referência para ordenar/filtrar por faixa. Locação: aluguel +
 * condomínio + IPTU (não há campo de seguro-incêndio no feed Carga — ver
 * docs/feed-analysis.md; não inventamos o dado, somamos só o que existe).
 */
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

/** Formato bruto do searchParams do Next — parâmetro repetido (checkbox) vira array. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Normaliza um valor de searchParams para uma única string (pega o primeiro se vier array). */
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Normaliza um valor de searchParams para lista (checkbox com 1 marcado vem como string, não array). */
function toList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export interface ListagemFiltros {
  cidade: string;
  finalidade: Finalidade;
  /** Restringe a um tipo fixo (páginas /{tipo}-a-venda-em-{cidade}); undefined = qualquer tipo. */
  tipoFixo?: string;
  searchParams: RawSearchParams;
}

export function ListagemImoveis({ cidade, finalidade, tipoFixo, searchParams }: ListagemFiltros) {
  const bairro = first(searchParams.bairro);
  const tipo = first(searchParams.tipo);
  const dormitorios = first(searchParams.dormitorios);
  const suites = first(searchParams.suites);
  const vagas = first(searchParams.vagas);
  const precoMin = first(searchParams.precoMin);
  const precoMax = first(searchParams.precoMax);
  const ordenarParam = first(searchParams.ordenar);
  const pageParam = first(searchParams.page);

  let listings = getActiveListings().filter(
    (l) => l.finalidade === finalidade && slugify(l.cidade) === slugify(cidade)
  );

  if (tipoFixo) {
    listings = listings.filter((l) => slugify(l.tipoImovel) === slugify(tipoFixo));
  } else if (tipo) {
    const tipos = tipo.split(",").map(slugify);
    listings = listings.filter((l) => tipos.includes(slugify(l.tipoImovel)));
  }

  if (bairro) {
    listings = listings.filter((l) => slugify(l.bairro).includes(slugify(bairro)));
  }
  if (dormitorios) {
    const min = Number(dormitorios);
    if (!Number.isNaN(min)) listings = listings.filter((l) => l.qtdDormitorios >= min);
  }
  if (suites) {
    const min = Number(suites);
    if (!Number.isNaN(min)) listings = listings.filter((l) => l.qtdSuites >= min);
  }
  if (vagas) {
    const min = Number(vagas);
    if (!Number.isNaN(min)) listings = listings.filter((l) => l.qtdVagas >= min);
  }
  if (precoMin) {
    const min = Number(precoMin);
    if (!Number.isNaN(min)) listings = listings.filter((l) => precoDe(l) >= min);
  }
  if (precoMax) {
    const max = Number(precoMax);
    if (!Number.isNaN(max)) listings = listings.filter((l) => precoDe(l) <= max);
  }

  // Características disponíveis para filtrar = só as que aparecem nos imóveis
  // já filtrados até aqui (antes do próprio filtro de característica) — nunca
  // mostra opção de filtro para característica que nenhum resultado tem.
  const caracteristicasDisponiveis = [...new Set(listings.flatMap((l) => l.caracteristicas))]
    .filter((key) => CHARACTERISTIC_MAP[key])
    .sort((a, b) => CHARACTERISTIC_MAP[a].label.localeCompare(CHARACTERISTIC_MAP[b].label));

  const caracteristicasSelecionadas = toList(searchParams.caracteristicas);
  if (caracteristicasSelecionadas.length) {
    listings = listings.filter((l) => caracteristicasSelecionadas.every((c) => l.caracteristicas.includes(c)));
  }

  const ordenacao = (ordenarParam as Ordenacao) || "mais-recente";
  listings = ordenar(listings, ordenacao);

  const page = Math.max(1, Number(pageParam) || 1);
  const totalPaginas = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const pagina = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function buildPageHref(p: number) {
    const params = new URLSearchParams();
    if (bairro) params.set("bairro", bairro);
    if (tipo) params.set("tipo", tipo);
    if (dormitorios) params.set("dormitorios", dormitorios);
    if (suites) params.set("suites", suites);
    if (vagas) params.set("vagas", vagas);
    if (precoMin) params.set("precoMin", precoMin);
    if (precoMax) params.set("precoMax", precoMax);
    for (const c of caracteristicasSelecionadas) params.append("caracteristicas", c);
    if (ordenarParam) params.set("ordenar", ordenarParam);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="shrink-0 lg:w-72">
        <form className="flex flex-col gap-5 rounded-lg border border-borda bg-white p-5">
          <div>
            <h2 className="mb-3 font-display text-lg text-navy">Filtros</h2>
          </div>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-texto-suave">Bairro</span>
            <input
              type="text"
              name="bairro"
              defaultValue={bairro}
              className="rounded border border-borda px-3 py-2"
            />
          </label>

          <fieldset>
            <legend className="mb-1 text-sm text-texto-suave">
              {finalidade === "locacao" ? "Valor mensal (aluguel + condomínio + IPTU)" : "Faixa de valor"}
            </legend>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="precoMin"
                defaultValue={precoMin}
                placeholder="Mínimo"
                className="w-full rounded border border-borda px-3 py-2 text-sm"
              />
              <span className="text-texto-suave">–</span>
              <input
                type="number"
                name="precoMax"
                defaultValue={precoMax}
                placeholder="Máximo"
                className="w-full rounded border border-borda px-3 py-2 text-sm"
              />
            </div>
          </fieldset>

          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-texto-suave">Dorm.</span>
              <select name="dormitorios" defaultValue={dormitorios ?? ""} className="rounded border border-borda px-2 py-2 text-sm">
                <option value="">-</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-texto-suave">Suítes</span>
              <select name="suites" defaultValue={suites ?? ""} className="rounded border border-borda px-2 py-2 text-sm">
                <option value="">-</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-texto-suave">Vagas</span>
              <select name="vagas" defaultValue={vagas ?? ""} className="rounded border border-borda px-2 py-2 text-sm">
                <option value="">-</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </label>
          </div>

          {caracteristicasDisponiveis.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm text-texto-suave">Características</legend>
              <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1 text-sm">
                {caracteristicasDisponiveis.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-navy">
                    <input
                      type="checkbox"
                      name="caracteristicas"
                      value={key}
                      defaultChecked={caracteristicasSelecionadas.includes(key)}
                      className="accent-dourado"
                    />
                    {CHARACTERISTIC_MAP[key].label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-texto-suave">Ordenar por</span>
            <select name="ordenar" defaultValue={ordenacao} className="rounded border border-borda px-3 py-2 text-sm">
              <option value="mais-recente">Mais recente</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="maior-area">Maior área</option>
            </select>
          </label>

          <button type="submit" className="rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light">
            Aplicar filtros
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">
        <p className="mb-4 text-sm text-texto-suave">
          {listings.length} {listings.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>

        {pagina.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
