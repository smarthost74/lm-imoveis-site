import { permanentRedirect } from "next/navigation";

export default function SobreLegacyPage() {
  permanentRedirect("/quem-somos");
}
