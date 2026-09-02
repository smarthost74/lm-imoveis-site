import type { Metadata } from "next";
import { ListagemImoveis, type RawSearchParams } from "@/app/_shared/ListagemImoveis";
import { resolveCidadeNome } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string }>;
}): Promise<Metadata> {
  const { cidade } = await params;
  return { title: `Imóveis para alugar em ${resolveCidadeNome(cidade)}` };
}

export default async function AlugarPage({
  params,
  searchParams,
}: {
  params: Promise<{ cidade: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { cidade } = await params;
  const sp = await searchParams;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl text-navy sm:text-3xl">
        Imóveis para alugar em {resolveCidadeNome(cidade)}
      </h1>
      <ListagemImoveis cidade={cidade} finalidade="locacao" searchParams={sp} />
    </main>
  );
}
