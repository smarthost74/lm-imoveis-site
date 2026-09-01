import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { ImovelCard } from "@/components/ImovelCard";
import { LocationCard } from "@/components/LocationCard";
import { getActiveListings, getBairros, getCondominios } from "@/lib/data";
import { COMPANY } from "@/lib/company";
import { slugify } from "@/lib/feed/slug";

const BUSCAS_POPULARES = [
  { label: "Apartamento à venda em Taubaté", href: "/apartamento-a-venda-em-taubate" },
  { label: "Casa à venda em Taubaté", href: "/casa-a-venda-em-taubate" },
  { label: "Apartamento para alugar em Taubaté", href: "/apartamento-para-alugar-em-taubate" },
  { label: "Casa para alugar em Taubaté", href: "/casa-para-alugar-em-taubate" },
  { label: "Imóveis no Jardim das Nações", href: "/imoveis/taubate/jardim-das-nacoes" },
  { label: "Lançamentos em Taubaté e região", href: "/lancamentos" },
];

export default function HomePage() {
  const destaques = getActiveListings().slice(0, 8);
  const bairros = getBairros().slice(0, 4);
  const condominios = getCondominios().slice(0, 4);

  // 3 fotos principais de imóveis diferentes, para o banner (sem texto, só imagem).
  const fotosBanner = getActiveListings()
    .slice(0, 3)
    .map((l) => {
      const capa = l.fotos.find((f) => f.isPrimary) ?? l.fotos[0];
      return { src: capa.localPath ?? capa.sourceUrl, alt: `Foto de ${l.titulo}` };
    });

  return (
    <main className="flex flex-col gap-16 pb-16">
      <Hero layout="split" photos={fotosBanner}>
        <SearchBar cidades={["Taubaté"]} />
      </Hero>

      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">Imóveis em destaque</h2>
        {destaques.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destaques.map((l) => (
              <ImovelCard key={l.codigoImovel} listing={l} />
            ))}
          </div>
        ) : (
          <p className="text-texto-suave">Nenhum imóvel disponível no momento.</p>
        )}
      </section>

      {bairros.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">Bairros</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bairros.map((b) => (
              <LocationCard
                key={b.slug}
                nome={b.bairro}
                cidade={b.cidade}
                imageSrc="/demo/card.svg"
                imageAlt={`Bairro ${b.bairro}`}
                href={`/imoveis/${slugify(b.cidade)}/${b.slug}`}
                totalImoveis={b.totalAtivos}
                tipo="bairro"
              />
            ))}
          </div>
        </section>
      )}

      {condominios.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">Condomínios</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {condominios.map((c) => (
              <LocationCard
                key={c.slug}
                nome={c.condominio}
                cidade={`${c.bairro}, ${c.cidade}`}
                imageSrc="/demo/card.svg"
                imageAlt={`Condomínio ${c.condominio}`}
                href={`/imoveis/${slugify(c.cidade)}/${c.slug}`}
                totalImoveis={c.totalAtivos}
                tipo="condominio"
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">Serviços</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/area-do-locatario", label: "Área do locatário" },
            { href: "/area-do-proprietario", label: "Área do proprietário" },
            { href: "/segunda-via-boleto", label: "2ª via de boleto" },
            { href: "/ficha-cadastro", label: "Ficha de cadastro" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg border border-borda bg-white p-5 text-navy transition-shadow hover:shadow-md"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">Lançamentos</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {COMPANY.lancamentos.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-borda bg-white p-6 transition-shadow hover:shadow-md"
            >
              <p className="font-display text-xl text-navy">{l.nome}</p>
              <p className="mt-1 text-sm text-texto-suave">Saiba mais →</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 text-center">
        <h2 className="mb-4 font-display text-2xl text-navy sm:text-3xl">Quem somos</h2>
        <p className="text-texto-suave">
          A {COMPANY.nome} é uma imobiliária de Taubaté/SP, CRECI {COMPANY.creci}, dos sócios{" "}
          {COMPANY.socios.map((s) => s.nome).join(" e ")}. Fernando Moraes é advogado além de
          corretor de imóveis — um diferencial raro entre as imobiliárias da região.
        </p>
        <Link href="/quem-somos" className="mt-4 inline-block text-navy underline hover:text-dourado">
          Conheça a nossa história
        </Link>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">Buscas mais populares</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {BUSCAS_POPULARES.map((b) => (
            <Link key={b.href} href={b.href} className="text-sm text-texto-suave hover:text-navy hover:underline">
              {b.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
