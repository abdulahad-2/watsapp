import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Gemini init with key check
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing. AI routes will return 500 until it's set.");
}
const genAI = new GoogleGenerativeAI(apiKey || "");

// Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: { status: 400, message: "Message is required." }
      });
    }

    // Use a supported Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // build prompt
    let prompt = "You are a helpful AI assistant in a WhatsApp-like chat application. Be friendly.\n\n";
    if (conversationHistory.length > 0) {
      prompt += "Previous conversation:\n";
      conversationHistory.slice(-5).forEach(msg => {
        prompt += `${msg.sender === "ai" ? "Assistant" : "User"}: ${msg.text}\n`;
      });
      prompt += "\n";
    }
    prompt += `User: ${message}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = response.text();

    res.json({
      message: "AI response generated successfully",
      response: aiMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gemini AI Error:", error?.message || error);
    res.status(500).json({
      error: {
        status: 500,
        message: "Failed to generate AI response",
        details: error?.message || "Unknown error",
      },
    });
  }
});

// Health check
router.get("/status", (req, res) => {
  res.json({
    status: "AI service is running",
    model: "gemini-pro",
    timestamp: new Date().toISOString(),
  });
});

export default router;
