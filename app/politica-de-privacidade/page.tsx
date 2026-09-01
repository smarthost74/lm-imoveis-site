import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = { title: "Política de Privacidade" };

/**
 * Rascunho para revisão jurídica antes do lançamento — não é aconselhamento
 * jurídico definitivo. Descreve apenas o que o site de fato faz hoje
 * (formulário de lead, GA4); não inventar processos que não existem.
 */
export default function PoliticaDePrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl text-navy">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-texto-suave">
        Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
      </p>

      <div className="mt-6 flex flex-col gap-6 text-texto-suave">
        <section>
          <h2 className="mb-2 font-display text-lg text-navy">Quem trata os seus dados</h2>
          <p>
            {COMPANY.nome}, CNPJ {COMPANY.cnpj}, com sede na {COMPANY.endereco.logradouro},{" "}
            {COMPANY.endereco.bairro}, {COMPANY.endereco.cidade}/{COMPANY.endereco.uf}, é a
            controladora dos dados pessoais coletados neste site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-navy">Quais dados coletamos</h2>
          <p>
            Quando você preenche o formulário de contato, coletamos nome, telefone, e-mail e a
            mensagem enviada. Também usamos ferramentas de analytics (Google Analytics) para
            entender como o site é usado, de forma agregada.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-navy">Para que usamos esses dados</h2>
          <p>
            Os dados do formulário são usados exclusivamente para responder ao seu contato sobre
            um imóvel ou serviço. Não vendemos nem compartilhamos seus dados com terceiros para
            fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-navy">Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento,
            entrando em contato pelo e-mail {COMPANY.emailLeads} ou pelo telefone{" "}
            {COMPANY.telefoneExibicao}.
          </p>
        </section>
      </div>
    </main>
  );
}
