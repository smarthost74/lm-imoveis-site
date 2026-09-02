"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/feed/slug";
import { SearchIcon } from "./icons";

/**
 * Busca horizontal com abas no formato de guias do Chrome — pedido
 * explícito do usuário. A aba ativa "funde" com o painel de campos logo
 * abaixo (mesma cor, sem borda entre os dois); a inativa fica recuada,
 * como uma guia de navegador em segundo plano.
 */
const TIPOS = ["Apartamento", "Casa", "Sala Comercial", "Loja", "Galpão"];

type Finalidade = "venda" | "locacao";

export function SearchBar({ cidades = ["Taubaté"] }: { cidades?: string[] }) {
  const router = useRouter();
  const [finalidade, setFinalidade] = useState<Finalidade>("venda");
  const [tipo, setTipo] = useState("");
  const [localizacao, setLocalizacao] = useState("");

  function buscar() {
    const cidade = cidades[0] ?? "Taubaté";
    if (tipo) {
      const acao = finalidade === "venda" ? "a-venda-em" : "para-alugar-em";
      const params = new URLSearchParams();
      if (localizacao) params.set("bairro", localizacao);
      const qs = params.toString();
      router.push(`/${slugify(tipo)}-${acao}-${slugify(cidade)}${qs ? `?${qs}` : ""}`);
      return;
    }
    const params = new URLSearchParams();
    if (localizacao) params.set("bairro", localizacao);
    router.push(
      `/${finalidade === "venda" ? "comprar" : "alugar"}/${slugify(cidade)}?${params.toString()}`
    );
  }

  return (
    <div className="w-full">
      <div role="tablist" aria-label="Finalidade da busca" className="flex gap-1 px-1">
        {(["venda", "locacao"] as const).map((f) => {
          const ativa = finalidade === f;
          return (
            <button
              key={f}
              role="tab"
              type="button"
              aria-selected={ativa}
              onClick={() => setFinalidade(f)}
              className={`rounded-t-lg px-6 py-2.5 text-sm font-medium transition-colors ${
                ativa
                  ? "bg-white text-navy"
                  : "mt-1 bg-borda text-texto-suave hover:bg-borda/70"
              }`}
            >
              {f === "venda" ? "Comprar" : "Alugar"}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-b-lg rounded-tr-lg bg-white p-4 shadow-md sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col text-sm">
          <span className="mb-1 font-medium text-texto-suave">Tipo de Imóvel</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded-lg border border-borda px-3 py-2.5 text-base sm:text-sm"
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-[2] flex-col text-sm">
          <span className="mb-1 font-medium text-texto-suave">Localização</span>
          <input
            type="text"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            placeholder="Digite cidade, bairro ou rua"
            className="rounded-lg border border-borda px-3 py-2.5 text-base sm:text-sm"
          />
        </label>

        <button
          type="button"
          onClick={buscar}
          className="flex items-center justify-center gap-2 rounded-lg bg-dourado px-6 py-2.5 font-medium text-navy transition-colors hover:brightness-95"
        >
          <SearchIcon className="h-4 w-4" />
          Buscar
        </button>
      </div>
    </div>
  );
}
