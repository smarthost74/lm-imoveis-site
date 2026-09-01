import { permanentRedirect } from "next/navigation";
import { bairroExiste } from "@/lib/data";

export default async function MobileBairroLegacyPage({
  params,
}: {
  params: Promise<{ cidade: string; bairro: string }>;
}) {
  const { cidade, bairro } = await params;
  permanentRedirect(bairroExiste(cidade, bairro) ? `/imoveis/${cidade}/${bairro}` : `/comprar/${cidade}`);
}
