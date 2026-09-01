import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Quem Somos",
  description: `${COMPANY.nome} — imobiliária em Taubaté/SP, CRECI ${COMPANY.creci}.`,
};

/**
 * Reescrita completa (ver briefing seção 10): sobre a EMPRESA, não sobre um
 * corretor; os dois sócios; diferencial verificável (Fernando é advogado
 * além de corretor); endereço e CRECI visíveis (E-E-A-T); sem superlativo
 * vazio.
 */
export default function QuemSomosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl text-navy">Quem somos</h1>

      <div className="mt-6 flex flex-col gap-4 text-texto-suave">
        <p>
          A {COMPANY.nome} é uma imobiliária de Taubaté/SP, inscrita no CRECI sob o número{" "}
          {COMPANY.creci} e no CNPJ {COMPANY.cnpj}. Atuamos com carteira própria de imóveis em
          Taubaté, com atendimento direto — sem intermediação de portal — para compra, venda e
          locação.
        </p>

        <p>
          A empresa é formada por dois sócios: {COMPANY.socios[0].nome} (CRECI{" "}
          {COMPANY.socios[0].creci}) e {COMPANY.socios[1].nome} (CRECI {COMPANY.socios[1].creci}).
        </p>

        <p>
          Um diferencial da nossa equipe: Fernando Moraes é advogado, além de corretor de
          imóveis. Isso significa que questões contratuais, de documentação e de due diligence
          imobiliária — normalmente terceirizadas pelas imobiliárias da região — são tratadas
          internamente, por quem também assina o contrato.
        </p>

        <p>
          Nosso escritório fica na {COMPANY.endereco.logradouro}, {COMPANY.endereco.bairro},{" "}
          {COMPANY.endereco.cidade}/{COMPANY.endereco.uf}, CEP {COMPANY.endereco.cep}. Atendimento
          de {COMPANY.horario}, pelo telefone {COMPANY.telefoneExibicao} ou pelo WhatsApp.
        </p>
      </div>
    </main>
  );
}
