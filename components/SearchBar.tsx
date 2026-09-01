"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/feed/slug";
import { SearchIcon } from "./icons";

/**
 * Busca compacta em cartão flutuante (padrão Chaves na Mão, pedido
 * explícito do usuário — ver CLAUDE.md). Abas Comprar/Alugar substituem as
 * abas originais "Imóveis/Veículos" do modelo de referência. Dormitórios e
 * faixa de valor saíram daqui — viraram filtro lateral na página de
 * listagem (mais detalhe faz sentido lá, não na busca de entrada).
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
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
      <h2 className="mb-4 font-display text-xl text-navy">Escolha o seu novo imóvel</h2>

      <div role="tablist" aria-label="Finalidade da busca" className="mb-4 flex gap-2">
        {(["venda", "locacao"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={finalidade === f}
            onClick={() => setFinalidade(f)}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              finalidade === f
                ? "border-navy bg-navy text-white"
                : "border-borda bg-white text-texto-suave hover:border-navy"
            }`}
          >
            {f === "venda" ? "Comprar" : "Alugar"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-texto-suave">Tipo de Imóvel</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded-lg border border-borda px-3 py-2.5"
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-texto-suave">Localização</span>
          <input
            type="text"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            placeholder="Digite cidade, bairro ou rua"
            className="rounded-lg border border-borda px-3 py-2.5"
          />
        </label>

        <button
          type="button"
          onClick={buscar}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-dourado px-4 py-3 font-medium text-navy transition-colors hover:brightness-95"
        >
          <SearchIcon className="h-4 w-4" />
          Buscar
        </button>
      </div>
    </div>
  );
}
