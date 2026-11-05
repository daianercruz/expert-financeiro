import "dotenv/config";
import express from "express";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { sandboxRouter } from "./routes/sandbox.js";
import { chatRouter } from "./routes/chat.js";

const app = express();

const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";
const host = isProduction ? "0.0.0.0" : "127.0.0.1";

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

app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend do Expert Financeiro funcionando",
  });
});

app.use("/api/sandbox", sandboxRouter);
app.use("/api/chat", chatRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada.",
  });
});

if (existsSync(frontendIndex)) {
  app.use(express.static(frontendDirectory));
}

app.listen(port, host, () => {
  console.log(`Expert Financeiro iniciado na porta ${port}`);
});