import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = { title: "Lançamentos" };

export default function LancamentosPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl text-navy">Lançamentos</h1>
      <p className="mt-4 text-texto-suave">
        Empreendimentos parceiros com vendas em andamento. Cada um tem site próprio, com plantas,
        memorial e condições de pagamento.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {COMPANY.lancamentos.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-borda bg-white p-8 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-display text-2xl text-navy">{l.nome}</p>
            <p className="mt-2 text-sm text-texto-suave">Visitar site do empreendimento →</p>
          </a>
        ))}
      </div>
    </main>
  );
}
