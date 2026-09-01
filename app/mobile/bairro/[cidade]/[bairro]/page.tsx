import { permanentRedirect } from "next/navigation";

export default async function MobileBairroLegacyPage({
  params,
}: {
  params: Promise<{ cidade: string; bairro: string }>;
}) {
  const { cidade, bairro } = await params;
  permanentRedirect(`/imoveis/${cidade}/${bairro}`);
}
