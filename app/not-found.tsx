import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-24 text-center">
      <div>
        <h1 className="font-display text-3xl text-navy">Página não encontrada</h1>
        <p className="mt-2 text-texto-suave">
          O link pode estar desatualizado ou o imóvel pode não estar mais disponível. Busque de
          novo abaixo ou volte para a home.
        </p>
      </div>

      <SearchBar cidades={["Taubaté"]} />

      <Link href="/" className="text-navy underline hover:text-dourado">
        Voltar para a home
      </Link>
    </main>
  );
}
