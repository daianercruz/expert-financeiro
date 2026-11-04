import test from "node:test";
import assert from "node:assert/strict";
import { summarizeSpending } from "./spending.js";

function transaction(amount, category, options = {}) {
  return {
    amount,
    pending: false,
    iso_currency_code: "USD",
    personal_finance_category: { primary: category },
    ...options,
  };
}

test("agrupa saídas e exclui entradas, pendências e transferências", () => {
  const result = summarizeSpending([
    transaction(12, "FOOD_AND_DRINK"),
    transaction(4.33, "FOOD_AND_DRINK"),
    transaction(5.4, "TRANSPORTATION"),
    transaction(-500, "TRAVEL"),
    transaction(1000, "TRANSFER_OUT"),
    transaction(25, "LOAN_PAYMENTS"),
    transaction(20, "FOOD_AND_DRINK", { pending: true }),
  ]);

  assert.deepEqual(result, [
    {
      moeda: "USD",
      categoria: "FOOD_AND_DRINK",
      total: 16.33,
      transacoes: 2,
    },
    {
      moeda: "USD",
      categoria: "TRANSPORTATION",
      total: 5.4,
      transacoes: 1,
    },
  ]);
});

test("mantém moedas separadas e soma centavos corretamente", () => {
  const result = summarizeSpending([
    transaction(0.1, "FOOD_AND_DRINK"),
    transaction(0.2, "FOOD_AND_DRINK"),
    transaction(10, "FOOD_AND_DRINK", {
      iso_currency_code: "BRL",
    }),
  ]);

  assert.deepEqual(result, [
    {
      moeda: "BRL",
      categoria: "FOOD_AND_DRINK",
      total: 10,
      transacoes: 1,
    },
    {
      moeda: "USD",
      categoria: "FOOD_AND_DRINK",
      total: 0.3,
      transacoes: 2,
    },
  ]);
});