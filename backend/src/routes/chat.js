import { Router } from "express";
import { answerFinancialQuestion } from "../services/chat.js";

export const chatRouter = Router();

chatRouter.post("/", async (req, res) => {
  try {
    const result = await answerFinancialQuestion(req.body?.question);
    res.json(result);
  } catch (error) {
    if (error.code === "INVALID_QUESTION") {
      return res.status(400).json({
        error: error.message,
      });
    }

    const plaidCode = error.response?.data?.error_code;

    if (plaidCode === "PRODUCT_NOT_READY") {
      return res.status(503).json({
        error:
          "As transações estão sendo preparadas. Aguarde alguns segundos e tente novamente.",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error:
          "O Gemini atingiu um limite de uso. Aguarde e confira a cota no Google AI Studio.",
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        error:
          "O Gemini está temporariamente indisponível. Tente novamente mais tarde.",
      });
    }

    console.error("Falha no chat:", {
      code: plaidCode ?? error.code ?? "CHAT_ERROR",
      status: error.status ?? error.response?.status,
    });

    return res.status(502).json({
      error:
        "Não foi possível concluir a resposta. Tente novamente.",
    });
  }
});