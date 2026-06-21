require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please type something first." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        reply: "Gemini API key is missing. Please add it inside your .env file."
      });
    }

    const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite"
});

    const prompt = `You are Ask Arpita, a friendly and practical AI assistant. Give clear, helpful answers. User asked: ${message}`;
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.status(500).json({
      reply: "arpita is thinking....." });
  }
});

app.listen(PORT, () => {
  console.log(`Ask Arpita is running at http://localhost:${PORT}`);
});
