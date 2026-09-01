import type { Metadata } from "next";
import { ListagemImoveis } from "@/app/_shared/ListagemImoveis";
import { resolveCidadeNome } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string }>;
}): Promise<Metadata> {
  const { cidade } = await params;
  return { title: `Imóveis à venda em ${resolveCidadeNome(cidade)}` };
}

export default async function ComprarPage({
  params,
  searchParams,
}: {
  params: Promise<{ cidade: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { cidade } = await params;
  const sp = await searchParams;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl text-navy sm:text-3xl">
        Imóveis à venda em {resolveCidadeNome(cidade)}
      </h1>
      <ListagemImoveis cidade={cidade} finalidade="venda" searchParams={sp} />
    </main>
  );
}
