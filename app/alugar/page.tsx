import { redirect } from "next/navigation";

/** v1 opera só em Taubaté — quando houver mais cidades, isto vira uma página de seleção. */
export default function AlugarIndexPage() {
  redirect("/alugar/taubate");
}
