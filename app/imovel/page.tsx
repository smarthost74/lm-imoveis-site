import { permanentRedirect } from "next/navigation";

/** `/imovel` bare (com ou sem querystring de filtro) — sem contexto suficiente, cai no padrão. */
export default function ImovelBarePage() {
  permanentRedirect("/comprar/taubate");
}
