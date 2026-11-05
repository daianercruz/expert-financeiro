import { geminiClient } from "../config/gemini.js";

try {
  const response = await geminiClient.models.generateContent({
    model: "gemini-3.5-flash",
    contents: "Responda em português apenas: Conexão funcionando.",
  });

  if (!response.text?.trim()) {
    throw new Error("Resposta sem texto.");
  }

  console.log(response.text);
} catch (error) {
  console.error("Falha no teste:", {
    status: error.status,
    tipo: error.name,
  });

  process.exitCode = 1;
}