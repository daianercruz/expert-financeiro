function formatMoney(value, currency) {
  if (!currency) return `${value} (moeda não informada)`;

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function formatDate(value) {
  if (!value) return "Não informada";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function TransactionsTable({ data }) {
  const transactions = [...data.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="transactions-summary">
      <p>Últimas transações do período consultado.</p>

      {transactions.length === 0 ? (
        <p>Nenhuma transação encontrada.</p>
      ) : (
        <div
          className="transactions-scroll"
          role="region"
          aria-label="Tabela de transações"
          tabIndex={0}
        >
          <table className="transactions-table">
            <caption>
              Exibindo {transactions.length} de {data.total} transações
            </caption>

            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Descrição</th>
                <th scope="col">Movimento</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => {
                const currency =
                  transaction.iso_currency_code ??
                  transaction.unofficial_currency_code;

                const movement =
                  transaction.amount > 0
                    ? "Saída"
                    : transaction.amount < 0
                      ? "Entrada"
                      : "Sem movimento";

                return (
                  <tr key={transaction.transaction_id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>
                      {transaction.name}
                      {transaction.pending && (
                        <span className="pending-label">Pendente</span>
                      )}
                    </td>
                    <td>{movement}</td>
                    <td className="transaction-value">
                      {formatMoney(
                        Math.abs(transaction.amount),
                        currency
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="response-source">
        <p>
          Período: {formatDate(data.period.start)} até{" "}
          {formatDate(data.period.end)}
        </p>
        <p>Fonte: {data.source} · Dados fictícios</p>
      </div>
    </div>
  );
}