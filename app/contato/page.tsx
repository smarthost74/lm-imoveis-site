import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = { title: "Contato" };

export default function ContatoPage() {
  const enderecoCompleto = `${COMPANY.endereco.logradouro}, ${COMPANY.endereco.bairro}, ${COMPANY.endereco.cidade}/${COMPANY.endereco.uf}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-3xl text-navy">Contato</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <address className="flex flex-col gap-1 text-texto-suave not-italic">
            <span className="font-display text-lg text-navy">{COMPANY.nome}</span>
            <span>{enderecoCompleto}</span>
            <span>CEP {COMPANY.endereco.cep}</span>
            <span>{COMPANY.telefoneExibicao}</span>
            <span>{COMPANY.horario}</span>
            <span>CRECI {COMPANY.creci}</span>
          </address>

          <div className="mt-6 aspect-video overflow-hidden rounded-lg border border-borda">
            <iframe
              title={`Mapa de ${enderecoCompleto}`}
              width="100%"
              height="100%"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`}
            />
          </div>
        </div>

        <ContactCta mensagemWhatsapp="Olá! Vim pelo site e gostaria de mais informações." contexto="pagina-contato" />
      </div>
    </main>
  );
}
