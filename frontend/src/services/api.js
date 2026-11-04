async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, options);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível concluir a consulta.");
  }

  return data;
}

export function initializeSandbox() {
  return request("/sandbox/initialize", {
    method: "POST",
  });
}

export function getAccounts() {
  return request("/sandbox/accounts");
}

export function getTransactions() {
  return request("/sandbox/transactions");
}

export function getSpending() {
  return request("/sandbox/spending");
}