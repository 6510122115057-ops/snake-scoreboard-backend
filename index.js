// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ Mongo URI จาก ENV ถ้าขึ้น Render, ตอนนี้ในเครื่องใช้ localhost ไปก่อน
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/snake-scores";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err.message));

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 20 },
  score: { type: Number, required: true },
  mode: { type: String, enum: ["easy", "normal", "hard"], default: "easy" },
  createdAt: { type: Date, default: Date.now }
});

const Score = mongoose.model("Score", scoreSchema);

// ทดสอบ API
app.get("/", (req, res) => {
  res.send("Snake Scoreboard API OK");
});

// บันทึกคะแนน
app.post("/api/scores", async (req, res) => {
  try {
    const { name, score, mode } = req.body;
    if (!name || typeof score !== "number") {
      return res.status(400).json({ message: "invalid data" });
    }
    const doc = await Score.create({ name, score, mode });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

// ดึง top 10
app.get("/api/scores/top", async (req, res) => {
  try {
    const mode = req.query.mode || "hard";
    const top = await Score.find({ mode })
      .sort({ score: -1, createdAt: 1 })
      .limit(10)
      .lean();
    res.json(top);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Scoreboard API on port ${PORT}`));