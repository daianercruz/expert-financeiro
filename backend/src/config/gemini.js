import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Configure GEMINI_API_KEY no backend/.env");
}

export const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});