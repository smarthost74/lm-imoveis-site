/**
 * Modelo de dados derivado do feed `Carga` da ImobiBrasil.
 * Ver docs/feed-analysis.md para a validação contra o catálogo completo.
 *
 * Campos marcados "não confirmado" existem no schema mas seu significado
 * ou taxa de preenchimento não foi validado — não usar em filtro/UI sem
 * decisão explícita registrada em CLAUDE.md.
 */

export type Finalidade = "venda" | "locacao";

export interface ListingPhoto {
  filename: string;
  /** URL original no domínio da ImobiBrasil — a origem para o download/re-hospedagem. */
  sourceUrl: string;
  /** Caminho local após o pipeline re-hospedar a imagem (Etapa 3). */
  localPath?: string;
  isPrimary: boolean;
}

/**
 * Uma característica booleana do imóvel/condomínio, tal como aparece no
 * feed (tag XML solta, valor "1"). Lista aberta — ver CHARACTERISTIC_MAP.
 */
export type CharacteristicKey = string;

export type CharacteristicGroup =
  | "lazer_condominio"
  | "seguranca"
  | "acabamento_imovel"
  | "infraestrutura_lote";

export interface CharacteristicInfo {
  key: CharacteristicKey;
  label: string;
  group: CharacteristicGroup;
}

export interface Listing {
  /** Chave primária do feed, ex. "APVE057_2-4369235". Base do slug. */
  codigoImovel: string;
  slug: string;

  titulo: string;
  tipoImovel: string; // "Apartamento" | "Casa" | ... (lista aberta)
  subTipoImovel: string;
  categoriaImovel: string; // "Padrão" | "Térrea" | ... (lista aberta)

  /**
   * Campo bruto do feed, significado não confirmado (ver docs/feed-analysis.md
   * seção 8). Preservado para quando o significado for esclarecido; não usar
   * em filtro ou exibição na v1.
   */
  tipoOfertaRaw: string;

  finalidade: Finalidade;

  uf: string;
  cidade: string;
  bairro: string;
  cep: string;
  endereco: string;
  numero: string;

  /** Nome do condomínio/edifício, quando confirmado manualmente. Não é gerado automaticamente. */
  condominio?: string;

  precoVenda?: number;
  /** Nenhum imóvel no feed tem esse dado hoje — mantido para quando existir locação. */
  precoLocacao?: number;
  precoCondominio?: number;
  valorIptu?: number;
  /** Só calculado quando finalidade === "locacao" e os três valores existem. */
  custoTotalMensal?: number;

  areaUtil: number;
  /** Ausente em parte do catálogo — cair para areaUtil na exibição quando faltar. */
  areaTotal?: number;

  qtdDormitorios: number;
  qtdSuites: number;
  qtdBanheiros: number;
  qtdVagas: number;
  qtdSalas?: number;
  qtdElevador?: number;

  /** Parágrafos únicos de Observacao, já sanitizados (ver lib/feed/sanitize-description.ts). */
  descricaoIntro: string;
  /** Parágrafo sobre bairro/condomínio extraído de Observacao, quando existe. */
  descricaoBairro?: string;

  caracteristicas: CharacteristicKey[];

  fotos: ListingPhoto[];

  /**
   * v1: sempre o WhatsApp/telefone da imobiliária (fallback vira regra —
   * feed não traz corretor por imóvel). Ponto de extensão para v2+.
   */
  corretor: {
    nome: string;
    whatsapp: string;
    telefone: string;
    email?: string;
  };

  /** Se o imóvel não aparecer mais no feed, vira "vendido/indisponível" em vez de 404. */
  status: "ativo" | "indisponivel";

  /** Timestamp do atributo `data` do elemento raiz <Carga>, para auditoria do pipeline. */
  atualizadoEm: string;

  // --- Pontos de extensão para v2/v3, não implementados na v1 ---
  /** Preservado mesmo sem uso: R$/m² comparado no card (v2). */
  precoPorM2?: number;
  /** Preservado mesmo sem uso: filtro por garantia aceita (v2). Feed Carga não expõe hoje. */
  garantiasAceitas?: string[];
}

export interface FeedMetadata {
  /** Atributo `data` de <Carga data="..."> */
  geradoEm: string;
  totalImoveis: number;
  /** Tags de característica encontradas sem mapeamento em CHARACTERISTIC_MAP. */
  tagsNaoMapeadas: string[];
}

export interface ParsedFeed {
  metadata: FeedMetadata;
  listings: Listing[];
}
