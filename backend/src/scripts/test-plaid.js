import { Products } from "plaid";
import { plaidClient } from "../config/plaid.js";

try {
  const { data: sandbox } = await plaidClient.sandboxPublicTokenCreate({
    institution_id: "ins_109508",
    initial_products: [Products.Transactions],
  });

  const { data: item } = await plaidClient.itemPublicTokenExchange({
    public_token: sandbox.public_token,
  });

  const { data } = await plaidClient.accountsGet({
    access_token: item.access_token,
  });

  console.log("Conexão com Plaid Sandbox funcionando!");
  console.log(`Contas encontradas: ${data.accounts.length}`);

  console.table(
    data.accounts.map((account) => ({
      conta: account.name,
      tipo: account.type,
      moeda:
        account.balances.iso_currency_code ??
        account.balances.unofficial_currency_code ??
        "Não informada",
      saldo_atual: account.balances.current,
      saldo_disponivel: account.balances.available,
    }))
  );

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 30);

  let transactionsData;

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await plaidClient.transactionsGet({
        access_token: item.access_token,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
        options: { count: 100, offset: 0 },
      });

      transactionsData = response.data;
      break;
    } catch (error) {
      const code = error.response?.data?.error_code;

      if (code !== "PRODUCT_NOT_READY" || attempt === 6) {
        throw error;
      }

      console.log("Aguardando a Plaid preparar as transações...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(
    `Exibindo ${transactionsData.transactions.length} de ` +
      `${transactionsData.total_transactions} transações no período.`
  );

  console.table(
    transactionsData.transactions.map((transaction) => ({
      data: transaction.date,
      descricao: transaction.name,
      valor: transaction.amount,
      moeda:
        transaction.iso_currency_code ??
        transaction.unofficial_currency_code ??
        "Não informada",
      categoria:
        transaction.personal_finance_category?.primary ??
        "Não informada",
      pendente: transaction.pending,
    }))
  );
} catch (error) {
  console.error("Falha ao testar a Plaid:", {
    code:
      error.response?.data?.error_code ??
      error.code ??
      error.name,
    requestId: error.response?.data?.request_id,
  });

  process.exitCode = 1;
}