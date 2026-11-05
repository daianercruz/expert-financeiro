function formatMoney(value, currency) {
  if (value == null) return "Não informado";
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

export default function AccountsSummary({ accounts }) {
  return (
    <div className="accounts-summary">
      <p>Veja os saldos das suas contas fictícias.</p>

      {accounts.length === 0 ? (
        <p>Nenhuma conta encontrada.</p>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => {
            const currency =
              account.balances.iso_currency_code ??
              account.balances.unofficial_currency_code;

            const isDebt =
              account.type === "credit" || account.type === "loan";

            const isInvestment = account.type === "investment";

            const label = isDebt
              ? "Saldo devedor"
              : isInvestment
                ? "Saldo do investimento"
                : "Saldo disponível";

            const value =
              isDebt || isInvestment
                ? account.balances.current
                : account.balances.available;

            return (
              <div className="account-card" key={account.id}>
                <h3>{account.name}</h3>
                <span className="account-card-label">{label}</span>
                <strong className="account-card-value">
                  {formatMoney(value, currency)}
                </strong>
              </div>
            );
          })}
        </div>
      )}

      <div className="response-source">
        <p>
          Cartões e empréstimos representam dívida. Investimentos
          não são tratados como dinheiro disponível.
        </p>
        <p>“Não informado” não significa saldo zero.</p>
        <p>Fonte: Plaid Sandbox · Dados fictícios</p>
      </div>
    </div>
  );
}