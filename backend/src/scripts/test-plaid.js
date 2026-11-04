import { Products } from "plaid";
import { plaidClient } from "../config/plaid.js";
import { summarizeSpending } from "../services/spending.js";

async function getTransactionsPage(request) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await plaidClient.transactionsGet(request);
      return response.data;
    } catch (error) {
      const code = error.response?.data?.error_code;

      if (code !== "PRODUCT_NOT_READY" || attempt === 6) {
        throw error;
      }

      console.log("Aguardando a Plaid preparar as transações...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

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

  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  const transactions = [];
  let offset = 0;
  let totalTransactions = 0;

  do {
    const page = await getTransactionsPage({
      access_token: item.access_token,
      start_date: start,
      end_date: end,
      options: { count: 100, offset },
    });

    totalTransactions = page.total_transactions;

    if (page.transactions.length === 0 && offset < totalTransactions) {
      throw new Error("Paginação interrompida antes de obter todas as transações.");
    }

    transactions.push(...page.transactions);
    offset += page.transactions.length;
  } while (offset < totalTransactions);

  console.log(`Período consultado: ${start} até ${end}`);
  console.log(
    `Recebidas ${transactions.length} de ${totalTransactions} transações.`
  );

  console.table(
    transactions.map((transaction) => ({
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

 const spending = summarizeSpending(transactions);

  console.log(
    "Saídas brutas por categoria — sem descontar estornos."
  );

  if (spending.length === 0) {
    console.log("Nenhuma saída elegível no período.");
  } else {
    console.table(spending);
  } 
} catch (error) {
  console.error("Falha ao testar a Plaid:", {
    code:
      error.response?.data?.error_code ??
      error.code ??
      error.name,
    requestId: error.response?.data?.request_id,
  });

  if (!error.response) {
    console.error(error.message);
  }

  process.exitCode = 1;
}