import { permanentRedirect } from "next/navigation";

/** Sem blog na v1 (briefing não prevê) — home evita 404 morto. */
export default function NoticiasLegacyPage() {
  permanentRedirect("/");
}
