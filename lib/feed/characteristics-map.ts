import type { CharacteristicGroup, CharacteristicInfo, CharacteristicKey } from "./types.ts";

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
  Restaurante: { key: "Restaurante", label: "Restaurante", group: "lazer_condominio" },

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
  Esgoto: { key: "Esgoto", label: "Esgoto", group: "infraestrutura_lote" },
  GasEncanado: { key: "GasEncanado", label: "Gás encanado", group: "infraestrutura_lote" },
  RuaAsfaltada: { key: "RuaAsfaltada", label: "Rua asfaltada", group: "infraestrutura_lote" },
  Esquina: { key: "Esquina", label: "Esquina", group: "infraestrutura_lote" },
  CasaPrincipal: { key: "CasaPrincipal", label: "Casa principal", group: "infraestrutura_lote" },
  Edicula: { key: "Edicula", label: "Edícula", group: "infraestrutura_lote" },

  // Lazer do condomínio (relabelado "Lazer e proximidades" quando o imóvel
  // não tem condomínio — ver app/imovel/[...legacy]/page.tsx — por isso
  // itens de entorno/vista natural entram aqui, não só amenidade construída)
  Bosque: { key: "Bosque", label: "Bosque", group: "lazer_condominio" },
  Rio: { key: "Rio", label: "Rio", group: "lazer_condominio" },
  VistaPanoramica: { key: "VistaPanoramica", label: "Vista panorâmica", group: "lazer_condominio" },
  Solarium: { key: "Solarium", label: "Solarium", group: "lazer_condominio" },
  SpaHidromassagem: { key: "SpaHidromassagem", label: "Spa com hidromassagem", group: "lazer_condominio" },
  EstacionamentoVisitantes: { key: "EstacionamentoVisitantes", label: "Estacionamento para visitantes", group: "lazer_condominio" },

  // Segurança
  Acesso24Horas: { key: "Acesso24Horas", label: "Acesso 24 horas", group: "seguranca" },

  // Acabamento do imóvel
  Acessibilidade: { key: "Acessibilidade", label: "Acessibilidade", group: "acabamento_imovel" },
  AmbientesIntegrados: { key: "AmbientesIntegrados", label: "Ambientes integrados", group: "acabamento_imovel" },
  ArmarioCozinha: { key: "ArmarioCozinha", label: "Armário de cozinha", group: "acabamento_imovel" },
  ArmarioEmbutido: { key: "ArmarioEmbutido", label: "Armário embutido", group: "acabamento_imovel" },
  Despensa: { key: "Despensa", label: "Despensa", group: "acabamento_imovel" },
  Escritorio: { key: "Escritorio", label: "Escritório", group: "acabamento_imovel" },
  Fogao: { key: "Fogao", label: "Fogão", group: "acabamento_imovel" },
  Lareira: { key: "Lareira", label: "Lareira", group: "acabamento_imovel" },
  PisoElevado: { key: "PisoElevado", label: "Piso elevado", group: "acabamento_imovel" },
  SalaJantar: { key: "SalaJantar", label: "Sala de jantar", group: "acabamento_imovel" },
  ProntoMorar: { key: "ProntoMorar", label: "Pronto para morar", group: "acabamento_imovel" },
  StandVendasLocal: { key: "StandVendasLocal", label: "Stand de vendas no local", group: "acabamento_imovel" },

  // Condições de negociação (não é característica física do imóvel, mas
  // vem no mesmo campo de tags do feed)
  AceitaPermuta: { key: "AceitaPermuta", label: "Aceita permuta", group: "condicoes_negociacao" },
  AceitaPermutaCarro: { key: "AceitaPermutaCarro", label: "Aceita permuta por carro", group: "condicoes_negociacao" },
  AceitaPermutaImovel: { key: "AceitaPermutaImovel", label: "Aceita permuta por imóvel", group: "condicoes_negociacao" },
  EstudaPermuta: { key: "EstudaPermuta", label: "Estuda permuta", group: "condicoes_negociacao" },
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

const GROUP_LABELS: Record<CharacteristicGroup, string> = {
  lazer_condominio: "Lazer do condomínio",
  seguranca: "Segurança",
  acabamento_imovel: "Acabamento do imóvel",
  infraestrutura_lote: "Infraestrutura do terreno/lote",
  condicoes_negociacao: "Condições de negociação",
};

export function groupCharacteristics(
  keys: CharacteristicKey[]
): { group: CharacteristicGroup; groupLabel: string; items: CharacteristicInfo[] }[] {
  const { known } = mapCharacteristics(keys);
  const groups = new Map<CharacteristicGroup, CharacteristicInfo[]>();
  for (const info of known) {
    const list = groups.get(info.group) ?? [];
    list.push(info);
    groups.set(info.group, list);
  }
  return [...groups.entries()].map(([group, items]) => ({
    group,
    groupLabel: GROUP_LABELS[group],
    items,
  }));
}
