import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { InstagramIcon, FacebookIcon } from "./icons";

/**
 * Rodapé em colunas por intenção (padrão VivaReal) + NAP completo, exigido
 * para E-E-A-T e para o Schema JSON-LD (Etapa 6) ter de onde citar.
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-borda bg-navy text-white/80">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <Image src="/logo.png" alt={COMPANY.nome} width={1600} height={781} className="h-10 w-auto" />
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 pb-12 pt-8 sm:grid-cols-4">
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-dourado-light">
            Encontrar imóveis
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/comprar" className="hover:text-white">Comprar</Link></li>
            <li><Link href="/alugar" className="hover:text-white">Alugar</Link></li>
            <li><Link href="/lancamentos" className="hover:text-white">Lançamentos</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-dourado-light">
            Serviços
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/area-do-locatario" className="hover:text-white">Área do locatário</Link></li>
            <li><Link href="/area-do-proprietario" className="hover:text-white">Área do proprietário</Link></li>
            <li><Link href="/segunda-via-boleto" className="hover:text-white">2ª via de boleto</Link></li>
            <li><Link href="/ficha-cadastro" className="hover:text-white">Ficha de cadastro</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-dourado-light">
            Institucional
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/quem-somos" className="hover:text-white">Quem somos</Link></li>
            <li><Link href="/politica-de-privacidade" className="hover:text-white">Política de privacidade (LGPD)</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-dourado-light">
            Contato
          </h2>
          <address className="flex flex-col gap-1 text-sm not-italic">
            <span>{COMPANY.nome}</span>
            <span>{COMPANY.endereco.logradouro}</span>
            <span>
              {COMPANY.endereco.bairro}, {COMPANY.endereco.cidade}/{COMPANY.endereco.uf}
            </span>
            <span>CEP {COMPANY.endereco.cep}</span>
            <span>{COMPANY.telefoneExibicao}</span>
            <span>CNPJ {COMPANY.cnpj}</span>
            <span>CRECI {COMPANY.creci}</span>
            <span>{COMPANY.horario}</span>
          </address>

          <div className="mt-4 flex gap-3">
            <a
              href={COMPANY.redesSociais[0]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook da Lobato & Moraes Imóveis"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:border-dourado-light hover:text-dourado-light"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={COMPANY.redesSociais[1]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Lobato & Moraes Imóveis"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:border-dourado-light hover:text-dourado-light"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {COMPANY.nome}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
