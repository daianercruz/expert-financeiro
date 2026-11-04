import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend do Expert Financeiro funcionando",
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Servidor disponível em http://localhost:${port}`);
});