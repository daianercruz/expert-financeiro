import "dotenv/config";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { sandboxRouter } from "./routes/sandbox.js";
import { chatRouter } from "./routes/chat.js";

const app = express();

const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";
const host = isProduction ? "0.0.0.0" : "127.0.0.1";

// Em produção, considera um proxy à frente do servidor.
// Vamos conferir essa configuração na hospedagem.
if (isProduction) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

const frontendDirectory = fileURLToPath(
  new URL("../../frontend/dist/", import.meta.url)
);

const frontendIndex = fileURLToPath(
  new URL("../../frontend/dist/index.html", import.meta.url)
);

if (isProduction && !existsSync(frontendIndex)) {
  throw new Error(
    "Frontend não encontrado. Execute o build antes de iniciar."
  );
}

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas consultas. Aguarde um minuto e tente novamente.",
  },
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Limite de 10 perguntas em 15 minutos atingido. Aguarde para continuar.",
  },
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend do Expert Financeiro funcionando",
  });
});

app.use("/api", apiLimiter);
app.use(express.json({ limit: "16kb" }));

app.use("/api/sandbox", sandboxRouter);
app.use("/api/chat", chatLimiter, chatRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada.",
  });
});

if (existsSync(frontendIndex)) {
  app.use(express.static(frontendDirectory));
}

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "A mensagem enviada é muito grande.",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "O conteúdo enviado não é um JSON válido.",
    });
  }

  console.error("Erro no servidor:", {
    type: error.name,
    code: error.code,
  });

  return res.status(500).json({
    error: "Ocorreu um erro interno no servidor.",
  });
});

app.listen(port, host, () => {
  console.log(`Expert Financeiro iniciado na porta ${port}`);
});