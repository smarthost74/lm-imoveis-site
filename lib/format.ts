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

/** R$/m² para venda — pedido explícito do usuário (não confundir com o `precoPorM2` de v2, que viria pronto do feed). */
export function formatCurrencyPerM2(precoTotal: number, area: number): string | undefined {
  if (!area) return undefined;
  return `${currencyFormatter.format(precoTotal / area)}/m²`;
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
