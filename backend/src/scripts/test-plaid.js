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
} catch (error) {
  console.error("Falha ao testar a Plaid:", {
    code: error.response?.data?.error_code ?? "CONNECTION_ERROR",
    requestId: error.response?.data?.request_id,
  });

  process.exitCode = 1;
}