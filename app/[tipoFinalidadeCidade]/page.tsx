import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListagemImoveis, type RawSearchParams } from "@/app/_shared/ListagemImoveis";
import { parseTipoFinalidadeCidadeSlug } from "@/lib/routes";
import { getActiveListings, resolveCidadeNome } from "@/lib/data";
import { slugify } from "@/lib/feed/slug";

function resolveTipoLabel(cidade: string, finalidade: "venda" | "locacao", tipoSlug: string) {
  const listing = getActiveListings().find(
    (l) =>
      l.finalidade === finalidade &&
      slugify(l.cidade) === slugify(cidade) &&
      slugify(l.tipoImovel) === tipoSlug
  );
  return listing?.tipoImovel;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tipoFinalidadeCidade: string }>;
}): Promise<Metadata> {
  const { tipoFinalidadeCidade } = await params;
  const parsed = parseTipoFinalidadeCidadeSlug(tipoFinalidadeCidade);
  if (!parsed) return {};
  const tipoLabel = resolveTipoLabel(parsed.cidadeSlug, parsed.finalidade, parsed.tipoSlug) ?? parsed.tipoSlug;
  const cidadeLabel = resolveCidadeNome(parsed.cidadeSlug);
  const acao = parsed.finalidade === "venda" ? "à venda" : "para alugar";
  return { title: `${tipoLabel} ${acao} em ${cidadeLabel}` };
}

export default async function TipoFinalidadeCidadePage({
  params,
  searchParams,
}: {
  params: Promise<{ tipoFinalidadeCidade: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { tipoFinalidadeCidade } = await params;
  const sp = await searchParams;
  const parsed = parseTipoFinalidadeCidadeSlug(tipoFinalidadeCidade);
  if (!parsed) notFound();

  const { tipoSlug, finalidade, cidadeSlug } = parsed;
  const tipoLabel = resolveTipoLabel(cidadeSlug, finalidade, tipoSlug) ?? tipoSlug;
  const cidadeLabel = resolveCidadeNome(cidadeSlug);
  const acao = finalidade === "venda" ? "à venda" : "para alugar";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl text-navy sm:text-3xl">
        {tipoLabel} {acao} em {cidadeLabel}
      </h1>
      <ListagemImoveis cidade={cidadeSlug} finalidade={finalidade} tipoFixo={tipoSlug} searchParams={sp} />
    </main>
  );
}
