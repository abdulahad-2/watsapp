import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat with AI endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: { status: 400, message: "Message is required." }
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build conversation context
    let prompt = "You are a helpful AI assistant in a WhatsApp-like chat application. Be friendly and conversational.\n\n";
    
    // Add conversation history for context
    if (conversationHistory.length > 0) {
      prompt += "Previous conversation:\n";
      conversationHistory.slice(-5).forEach(msg => { // Last 5 messages for context
        prompt += `${msg.sender === 'ai' ? 'Assistant' : 'User'}: ${msg.text}\n`;
      });
      prompt += "\n";
    }
    
    prompt += `User: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = response.text();

    res.json({
      message: "AI response generated successfully",
      response: aiMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({
      error: { 
        status: 500, 
        message: "Failed to generate AI response",
        details: error.message 
      }
    });
  }
});

// Health check for AI service
router.get("/status", (req, res) => {
  res.json({
    status: "AI service is running",
    model: "gemini-pro",
    timestamp: new Date().toISOString()
  });
});

export default router;
