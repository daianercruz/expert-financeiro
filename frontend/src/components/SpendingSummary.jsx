function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

const categoryLabels = {
  FOOD_AND_DRINK: "Alimentação",
  TRANSPORTATION: "Transporte",
  TRAVEL: "Viagens",
  RENT_AND_UTILITIES: "Moradia e serviços",
  GENERAL_MERCHANDISE: "Compras",
  PERSONAL_CARE: "Cuidados pessoais",
};

export default function SpendingSummary({ data }) {
  const categories = data.categories;

  return (
    <div className="spending-summary">
      <p>Veja suas saídas por categoria no período.</p>

      {categories.length === 0 ? (
        <p>Nenhuma saída elegível encontrada.</p>
      ) : (
        <div className="spending-bars">
          {categories.map((item) => {
            const largest = Math.max(
              ...categories
                .filter((category) => category.moeda === item.moeda)
                .map((category) => category.total)
            );

            const width =
              largest > 0 ? (item.total / largest) * 100 : 0;

            return (
              <div key={`${item.moeda}-${item.categoria}`}>
                <div className="spending-label">
                  <span>
                    {categoryLabels[item.categoria] ?? item.categoria}
                  </span>
                  <strong>{formatMoney(item.total, item.moeda)}</strong>
                </div>

                <div className="spending-track" aria-hidden="true">
                  <div
                    className="spending-fill"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="response-source">
        <p>
          Período: {data.period.start} até {data.period.end}
        </p>
        <p>{data.description}</p>
        <p>Fonte: {data.source} · Dados fictícios</p>
      </div>
    </div>
  );
}