import express from "express";
import { getCampusAgent } from "../ai/campusAgent.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
    const { message, userId } = req.body;
  console.log("=== CHAT REQUEST ===");
  console.log("userId:", userId);
  console.log("message:", message);
  try {
    const { message, userId } = req.body;
    if (!message?.trim() || !userId) {
      return res.status(400).json({ success: false, message: "message and userId required" });
    }

    const runner = await getCampusAgent(userId);
    const reply  = await runner.ask(message);

    // reply string hi hona chahiye — agar array ya object aaye to handle karo
    const finalReply = typeof reply === "string"
      ? reply
      : reply?.text || reply?.content || JSON.stringify(reply);

    res.json({ success: true, message: finalReply });
  } catch (err) {
    console.error("CampusBot error:", err);
    res.status(500).json({ success: false, message: "Bot unavailable, try again." });
  }
});

export default router;