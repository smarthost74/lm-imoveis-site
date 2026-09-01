const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatArea(value: number): string {
  return `${value.toLocaleString("pt-BR")} m²`;
}

/** Soma aluguel + condomínio + IPTU para exibir o custo total mensal na locação. */
export function calcularCustoTotalMensal(params: {
  precoLocacao?: number;
  precoCondominio?: number;
  valorIptu?: number;
}): number | undefined {
  const { precoLocacao, precoCondominio, valorIptu } = params;
  if (precoLocacao === undefined) return undefined;
  return precoLocacao + (precoCondominio ?? 0) + (valorIptu ?? 0);
}
