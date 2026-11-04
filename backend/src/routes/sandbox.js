import { Router } from "express";
import {
  initializeSandbox,
  getSandboxAccounts,
} from "../services/sandbox.js";

export const sandboxRouter = Router();

function handleError(error, res) {
  if (error.code === "SANDBOX_NOT_INITIALIZED") {
    return res.status(409).json({
      error: "Inicialize o Sandbox antes de consultar contas.",
    });
  }

  return res.status(502).json({
    error: "Não foi possível concluir a consulta à Plaid.",
    code: error.response?.data?.error_code ?? "CONNECTION_ERROR",
  });
}

sandboxRouter.post("/initialize", async (req, res) => {
  try {
    await initializeSandbox();

    res.json({
      status: "ok",
      message: "Sandbox inicializado com dados fictícios.",
    });
  } catch (error) {
    handleError(error, res);
  }
});

sandboxRouter.get("/accounts", async (req, res) => {
  try {
    const accounts = await getSandboxAccounts();

    res.json({
      source: "Plaid Sandbox",
      fictitious: true,
      accounts,
    });
  } catch (error) {
    handleError(error, res);
  }
});