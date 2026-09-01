import { readFileSync } from "node:fs";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { ImovelCard } from "@/components/ImovelCard";
import { LocationCard } from "@/components/LocationCard";
import { Gallery } from "@/components/Gallery";
import { ContactCta } from "@/components/ContactCta";
import { BrokerCard } from "@/components/BrokerCard";
import type { Listing } from "@/lib/feed/types";
import type { ListingStore } from "@/lib/feed/store";
import { COMPANY, buildWhatsappLink } from "@/lib/company";

/**
 * Página só para revisar os 8 componentes juntos durante a Etapa 4 —
 * não faz parte do site final, não linkar a partir de nenhum lugar público.
 * Lê data/listings.json (gerado pelo pipeline local) se existir; senão usa
 * um listing mínimo de exemplo para não quebrar a preview.
 */
function loadSampleListings(): Listing[] {
  try {
    const store = JSON.parse(readFileSync("data/listings.json", "utf-8")) as ListingStore;
    return Object.values(store.listings)
      .map((l) => ({
        ...l,
        fotos: l.fotos.map((f, i) => ({ ...f, localPath: undefined, sourceUrl: "/demo/card.svg", isPrimary: i === 0 })),
      }))
      .slice(0, 4);
  } catch {
    return [];
  }
}

export default function DemoComponentesPage() {
  const listings = loadSampleListings();
  const primeiro = listings[0];

  return (
    <main className="flex flex-col gap-16 pb-16">
      <Hero
        imageSrc="/demo/hero.svg"
        imageAlt="Fachada de apartamento em Taubaté"
        eyebrow="Taubaté/SP"
        headline="Imóveis com a curadoria de quem conhece a cidade"
        subheadline="Carteira própria, corretores CRECI, atendimento direto."
      >
        <SearchBar cidades={["Taubaté"]} />
      </Hero>

      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-4 font-display text-2xl text-navy">Imóveis em destaque</h2>
        {listings.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((l) => (
              <ImovelCard key={l.codigoImovel} listing={l} />
            ))}
          </div>
        ) : (
          <p className="text-texto-suave">
            Nenhum listing em data/listings.json — rode <code>npm run feed:fetch</code> localmente
            para popular esta preview.
          </p>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-4 font-display text-2xl text-navy">Bairros e condomínios</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <LocationCard
            nome="Jardim das Nações"
            cidade="Taubaté/SP"
            imageSrc="/demo/card.svg"
            imageAlt="Jardim das Nações"
            href="#"
            totalImoveis={3}
            tipo="bairro"
          />
          <LocationCard
            nome="Edifício Europa"
            cidade="Jardim das Nações, Taubaté/SP"
            imageSrc="/demo/card.svg"
            imageAlt="Edifício Europa"
            href="#"
            totalImoveis={1}
            tipo="condominio"
          />
        </div>
      </section>

      {primeiro && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <h2 className="mb-4 font-display text-2xl text-navy">Galeria de fotos</h2>
          <Gallery fotos={primeiro.fotos} tituloImovel={primeiro.titulo} />
        </section>
      )}

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-2xl text-navy">Card do corretor</h2>
          <BrokerCard
            nome={COMPANY.nome}
            creci={COMPANY.creci}
            telefone={COMPANY.telefoneExibicao}
            whatsapp={COMPANY.whatsapp}
            mensagemWhatsapp="Olá! Tenho interesse em um imóvel."
          />
        </div>
        <div>
          <h2 className="mb-4 font-display text-2xl text-navy">CTA de contato</h2>
          <ContactCta
            mensagemWhatsapp="Olá! Vim pelo site e quero mais informações."
            contexto="demo"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 text-sm text-texto-suave">
        <p>WhatsApp de teste: {buildWhatsappLink({ mensagem: "oi" })}</p>
      </section>
    </main>
  );
}
