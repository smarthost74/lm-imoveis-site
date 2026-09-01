import type { CharacteristicInfo, CharacteristicKey } from "./types";

/**
 * Dicionário tag XML → { label PT-BR, grupo }. Lista ABERTA: o parser deve
 * logar (não descartar) qualquer tag "1" encontrada que não esteja aqui.
 * Ver docs/feed-analysis.md seção 4 para a lista validada contra o catálogo real.
 */
export const CHARACTERISTIC_MAP: Record<CharacteristicKey, CharacteristicInfo> = {
  // Lazer do condomínio
  Piscina: { key: "Piscina", label: "Piscina", group: "lazer_condominio" },
  Academia: { key: "Academia", label: "Academia", group: "lazer_condominio" },
  Churrasqueira: { key: "Churrasqueira", label: "Churrasqueira", group: "lazer_condominio" },
  ChurrasqueiraVaranda: { key: "ChurrasqueiraVaranda", label: "Churrasqueira na varanda", group: "acabamento_imovel" },
  Playground: { key: "Playground", label: "Playground", group: "lazer_condominio" },
  SalaoFestas: { key: "SalaoFestas", label: "Salão de festas", group: "lazer_condominio" },
  SalaoJogos: { key: "SalaoJogos", label: "Salão de jogos", group: "lazer_condominio" },
  Sauna: { key: "Sauna", label: "Sauna", group: "lazer_condominio" },
  QuadraPoliEsportiva: { key: "QuadraPoliEsportiva", label: "Quadra poliesportiva", group: "lazer_condominio" },
  QuadraTenis: { key: "QuadraTenis", label: "Quadra de tênis", group: "lazer_condominio" },
  Clube: { key: "Clube", label: "Clube", group: "lazer_condominio" },
  AreaLazer: { key: "AreaLazer", label: "Área de lazer", group: "lazer_condominio" },
  EspacoGourmet: { key: "EspacoGourmet", label: "Espaço gourmet", group: "lazer_condominio" },
  Restaurante: { key: "Restaurante", label: "Restaurante no condomínio", group: "lazer_condominio" },

  // Acabamento do imóvel
  VarandaGourmet: { key: "VarandaGourmet", label: "Varanda gourmet", group: "acabamento_imovel" },
  CozinhaAmericana: { key: "CozinhaAmericana", label: "Cozinha americana", group: "acabamento_imovel" },
  MoveisPlanejados: { key: "MoveisPlanejados", label: "Móveis planejados", group: "acabamento_imovel" },
  Porcelanato: { key: "Porcelanato", label: "Piso em porcelanato", group: "acabamento_imovel" },
  Blindex: { key: "Blindex", label: "Box em blindex", group: "acabamento_imovel" },
  Closet: { key: "Closet", label: "Closet", group: "acabamento_imovel" },
  Lavabo: { key: "Lavabo", label: "Lavabo", group: "acabamento_imovel" },
  Mobiliado: { key: "Mobiliado", label: "Mobiliado", group: "acabamento_imovel" },
  Hidromassagem: { key: "Hidromassagem", label: "Hidromassagem", group: "acabamento_imovel" },
  Banheira: { key: "Banheira", label: "Banheira", group: "acabamento_imovel" },
  ArCondicionado: { key: "ArCondicionado", label: "Ar-condicionado", group: "acabamento_imovel" },
  Varanda: { key: "Varanda", label: "Varanda", group: "acabamento_imovel" },
  TV: { key: "TV", label: "Painel para TV", group: "acabamento_imovel" },
  SalaGrande: { key: "SalaGrande", label: "Sala ampla", group: "acabamento_imovel" },

  // Segurança
  Guarita: { key: "Guarita", label: "Guarita", group: "seguranca" },
  SegurancaInterna: { key: "SegurancaInterna", label: "Segurança interna", group: "seguranca" },
  SegurancaRua: { key: "SegurancaRua", label: "Segurança na rua", group: "seguranca" },
  Interfone: { key: "Interfone", label: "Interfone", group: "seguranca" },
  Cerca: { key: "Cerca", label: "Cerca elétrica", group: "seguranca" },

  // Infraestrutura do terreno/lote
  RedeTelefone: { key: "RedeTelefone", label: "Rede telefônica", group: "infraestrutura_lote" },
  Telefone: { key: "Telefone", label: "Telefone", group: "infraestrutura_lote" },
  EnergiaEletrica: { key: "EnergiaEletrica", label: "Energia elétrica", group: "infraestrutura_lote" },
  Agua: { key: "Agua", label: "Água encanada", group: "infraestrutura_lote" },
  Luz: { key: "Luz", label: "Luz", group: "infraestrutura_lote" },
  AreaServico: { key: "AreaServico", label: "Área de serviço", group: "infraestrutura_lote" },
  EntradaServicoIndependente: { key: "EntradaServicoIndependente", label: "Entrada de serviço independente", group: "infraestrutura_lote" },
  Quintal: { key: "Quintal", label: "Quintal", group: "infraestrutura_lote" },
};

export function mapCharacteristics(keys: CharacteristicKey[]): {
  known: CharacteristicInfo[];
  unmapped: CharacteristicKey[];
} {
  const known: CharacteristicInfo[] = [];
  const unmapped: CharacteristicKey[] = [];
  for (const key of keys) {
    const info = CHARACTERISTIC_MAP[key];
    if (info) known.push(info);
    else unmapped.push(key);
  }
  return { known, unmapped };
}
