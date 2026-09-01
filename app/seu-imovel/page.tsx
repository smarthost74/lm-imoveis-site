import { permanentRedirect } from "next/navigation";

/** "Cadastre seu imóvel" (proprietário) é v2 (briefing seção 7) — /contato mantém a intenção viva. */
export default function SeuImovelLegacyPage() {
  permanentRedirect("/contato");
}
