"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/feed/slug";
import { SearchIcon } from "./icons";

/**
 * Busca em abas Comprar | Alugar (padrão copiado do VivaReal — ver
 * CLAUDE.md). Cada aba tem sua própria escala de faixa de valor, porque
 * preço de venda e de aluguel não cabem na mesma régua.
 *
 * Sem dado de locação no feed hoje (ver docs/feed-analysis.md), a aba
 * "Alugar" fica visível e funcional — ao buscar, a página de listagem
 * mostra um estado vazio elegante em vez de sumir ou dar 404.
 */

const TIPOS_RESIDENCIAL = ["Apartamento", "Casa"] as const;
const TIPOS_COMERCIAL = ["Sala Comercial", "Loja", "Galpão"] as const;

const FAIXAS_VENDA = [
  { label: "Até R$ 300 mil", value: "0-300000" },
  { label: "R$ 300 mil a R$ 600 mil", value: "300000-600000" },
  { label: "R$ 600 mil a R$ 1 milhão", value: "600000-1000000" },
  { label: "Acima de R$ 1 milhão", value: "1000000-" },
];

const FAIXAS_LOCACAO = [
  { label: "Até R$ 1.500", value: "0-1500" },
  { label: "R$ 1.500 a R$ 3.000", value: "1500-3000" },
  { label: "R$ 3.000 a R$ 5.000", value: "3000-5000" },
  { label: "Acima de R$ 5.000", value: "5000-" },
];

type Finalidade = "venda" | "locacao";

export function SearchBar({ cidades = ["Taubaté"] }: { cidades?: string[] }) {
  const router = useRouter();
  const [finalidade, setFinalidade] = useState<Finalidade>("venda");
  const [cidade, setCidade] = useState(cidades[0]);
  const [bairro, setBairro] = useState("");
  const [tipos, setTipos] = useState<string[]>([]);
  const [dormitorios, setDormitorios] = useState("");
  const [faixa, setFaixa] = useState("");

  const faixas = finalidade === "venda" ? FAIXAS_VENDA : FAIXAS_LOCACAO;

  function toggleTipo(tipo: string) {
    setTipos((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]));
  }

  function buscar() {
    const params = new URLSearchParams();
    if (bairro) params.set("bairro", bairro);
    if (tipos.length) params.set("tipo", tipos.join(","));
    if (dormitorios) params.set("dormitorios", dormitorios);
    if (faixa) params.set("faixa", faixa);
    router.push(`/${finalidade === "venda" ? "comprar" : "alugar"}/${slugify(cidade)}?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
      <div role="tablist" aria-label="Finalidade da busca" className="flex">
        {(["venda", "locacao"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={finalidade === f}
            onClick={() => {
              setFinalidade(f);
              setFaixa("");
            }}
            className={`flex-1 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors ${
              finalidade === f
                ? "bg-white text-navy border-b-2 border-dourado"
                : "bg-creme text-texto-suave hover:text-navy"
            }`}
          >
            {f === "venda" ? "Comprar" : "Alugar"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Cidade</span>
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="rounded border border-borda px-3 py-2"
          >
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Bairro</span>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Qualquer bairro"
            className="rounded border border-borda px-3 py-2"
          />
        </label>

        <fieldset className="flex flex-col text-sm">
          <legend className="mb-1 text-texto-suave">Tipo</legend>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {[...TIPOS_RESIDENCIAL, ...TIPOS_COMERCIAL].map((tipo) => (
              <label key={tipo} className="flex items-center gap-1 text-texto-suave">
                <input
                  type="checkbox"
                  checked={tipos.includes(tipo)}
                  onChange={() => toggleTipo(tipo)}
                  className="accent-dourado"
                />
                {tipo}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Dormitórios</span>
          <select
            value={dormitorios}
            onChange={(e) => setDormitorios(e.target.value)}
            className="rounded border border-borda px-3 py-2"
          >
            <option value="">Qualquer</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-texto-suave">Faixa de valor</span>
          <select
            value={faixa}
            onChange={(e) => setFaixa(e.target.value)}
            className="rounded border border-borda px-3 py-2"
          >
            <option value="">Qualquer valor</option>
            {faixas.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={buscar}
          className="flex w-full items-center justify-center gap-2 rounded bg-navy px-4 py-3 font-medium text-white transition-colors hover:bg-navy-light"
        >
          <SearchIcon className="h-4 w-4" />
          Buscar
        </button>
      </div>
    </div>
  );
}
