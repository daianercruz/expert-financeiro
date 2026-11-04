import { Products } from "plaid";
import { plaidClient } from "../config/plaid.js";

let accessToken;
let initialization;

export async function initializeSandbox() {
  if (accessToken) {
    return;
  }

  if (!initialization) {
    initialization = createSandboxItem();
  }

  try {
    await initialization;
  } finally {
    initialization = undefined;
  }
}

async function createSandboxItem() {
  const { data: sandbox } = await plaidClient.sandboxPublicTokenCreate({
    institution_id: "ins_109508",
    initial_products: [Products.Transactions],
  });

  const { data: item } = await plaidClient.itemPublicTokenExchange({
    public_token: sandbox.public_token,
  });

  accessToken = item.access_token;
}

export async function getSandboxAccounts() {
  if (!accessToken) {
    const error = new Error("Inicialize o Sandbox antes de consultar contas.");
    error.code = "SANDBOX_NOT_INITIALIZED";
    throw error;
  }

  const { data } = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  return data.accounts.map((account) => ({
    id: account.account_id,
    name: account.name,
    type: account.type,
    subtype: account.subtype,
    balances: account.balances,
  }));
}