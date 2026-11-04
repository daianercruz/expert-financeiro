export function summarizeSpending(transactions) {
  const excludedCategories = new Set([
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "LOAN_PAYMENTS",
    "INCOME",
  ]);

  const groups = new Map();

  for (const transaction of transactions) {
    const category =
      transaction.personal_finance_category?.primary;

    const currency =
      transaction.iso_currency_code ??
      transaction.unofficial_currency_code;

    // Considera somente saídas confirmadas e classificadas.
    if (
      transaction.pending ||
      !Number.isFinite(transaction.amount) ||
      transaction.amount <= 0 ||
      !category ||
      !currency ||
      excludedCategories.has(category)
    ) {
      continue;
    }

    const key = JSON.stringify([currency, category]);

    const group = groups.get(key) ?? {
      moeda: currency,
      categoria: category,
      centavos: 0,
      transacoes: 0,
    };

    group.centavos += Math.round(transaction.amount * 100);
    group.transacoes += 1;

    groups.set(key, group);
  }

  return [...groups.values()]
    .sort(
      (a, b) =>
        a.moeda.localeCompare(b.moeda) ||
        b.centavos - a.centavos
    )
    .map((group) => ({
      moeda: group.moeda,
      categoria: group.categoria,
      total: group.centavos / 100,
      transacoes: group.transacoes,
    }));
}