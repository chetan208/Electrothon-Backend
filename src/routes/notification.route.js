import express from "express";
import Notification from "../model/Notification.js";
import mongoose from "mongoose";
import { runDailyOpportunityAgent } from "../ai/dailyOpportunityAgent.js";

const router = express.Router();

// GET — user ki notifications
router.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH — mark all as read
router.patch("/notifications/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH — single notification read
router.patch("/notifications/read/:notifId", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notifId, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get("/trigger-daily-agent", async (req, res) => {
  runDailyOpportunityAgent();
  res.json({ success: true, message: "Agent started in background" });
});

export default router;