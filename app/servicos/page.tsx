import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Serviços" };

const SERVICOS = [
  {
    href: "/area-do-locatario",
    titulo: "Área do locatário",
    descricao: "Contratos, boletos e comunicados para quem já aluga com a gente.",
  },
  {
    href: "/area-do-proprietario",
    titulo: "Área do proprietário",
    descricao: "Repasses, prestação de contas e documentos para quem tem imóvel administrado por nós.",
  },
  {
    href: "/segunda-via-boleto",
    titulo: "2ª via de boleto",
    descricao: "Emita a segunda via do seu boleto de aluguel diretamente pela área do locatário.",
  },
  {
    href: "/ficha-cadastro",
    titulo: "Ficha de cadastro",
    descricao: "Preencha o cadastro para locação ou compra de um imóvel da nossa carteira.",
  },
];

export default function ServicosPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl text-navy">Serviços</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SERVICOS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-borda bg-white p-6 transition-shadow hover:shadow-md"
          >
            <p className="font-display text-lg text-navy">{s.titulo}</p>
            <p className="mt-2 text-sm text-texto-suave">{s.descricao}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
