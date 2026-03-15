import express from "express";
import Student from "../model/studentModel.js";
import mongoose from "mongoose";
import { checkAuthMiddelware } from "../services/middelwares.js";

const router = express.Router();

// Safe regex — special chars escape karo
function safeRegex(str) {
  return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

router.get("/", checkAuthMiddelware, async (req, res) => {
  try {
    const userId = req.student._id.toString();
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const me = await Student.findById(userId)
      .select("connections collage branch skills interests")
      .lean();

    if (!me) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const myConnections = (me.connections || []).map(id => id.toString());
    const excludeIds = [...myConnections, userId];

    // Friends of friends — mutual count
    const friendsOfFriends = await Student.find({ _id: { $in: myConnections } })
      .select("connections").lean();

    const mutualCountMap = {};
    for (const friend of friendsOfFriends) {
      for (const conn of (friend.connections || [])) {
        const id = conn.toString();
        if (!excludeIds.includes(id)) {
          mutualCountMap[id] = (mutualCountMap[id] || 0) + 1;
        }
      }
    }

    // Build OR conditions safely
    const orConditions = [{ _id: { $in: Object.keys(mutualCountMap) } }];
    if (me.collage)   orConditions.push({ collage: me.collage });
    if (me.branch)    orConditions.push({ branch: me.branch });
    if (me.skills?.length)    orConditions.push({ skills:    { $in: me.skills.map(safeRegex) } });
    if (me.interests?.length) orConditions.push({ interests: { $in: me.interests.map(safeRegex) } });

    const candidates = await Student.find({
      _id: { $nin: excludeIds },
      $or: orConditions,
    })
    .populate("collage", "name type")
    .select("name headline avatar branch skills interests collage currentYear isVerified _id")
    .lean();

    // Score karo
    const mySkillsLower    = (me.skills    || []).map(s => s.toLowerCase());
    const myInterestsLower = (me.interests || []).map(i => i.toLowerCase());

    const scored = candidates.map(c => {
      let score = 0;
      const reasons = [];

      const mutuals = mutualCountMap[c._id.toString()] || 0;
      if (mutuals > 0) {
        score += mutuals * 5;
        reasons.push(`${mutuals} mutual connection${mutuals > 1 ? "s" : ""}`);
      }

      if (me.collage && c.collage?._id?.toString() === me.collage?.toString()) {
        score += 10;
        reasons.push("Same college");
      }

      if (me.branch && c.branch && me.branch === c.branch) {
        score += 8;
        reasons.push("Same branch");
      }

      const commonSkills = (c.skills || []).filter(s => mySkillsLower.includes(s.toLowerCase()));
      if (commonSkills.length > 0) {
        score += commonSkills.length * 3;
        reasons.push(`${commonSkills.length} common skill${commonSkills.length > 1 ? "s" : ""}`);
      }

      const commonInterests = (c.interests || []).filter(i => myInterestsLower.includes(i.toLowerCase()));
      if (commonInterests.length > 0) {
        score += commonInterests.length * 2;
        reasons.push(`${commonInterests.length} common interest${commonInterests.length > 1 ? "s" : ""}`);
      }

      return {
        _id: c._id,
        name: c.name,
        headline: c.headline || "",
        avatar: c.avatar || null,
        branch: c.branch || "",
        currentYear: c.currentYear || "",
        skills: c.skills?.slice(0, 4) || [],
        college: c.collage?.name || "N/A",
        isVerified: c.isVerified || false,
        mutualConnections: mutuals,
        score,
        reasons,
      };
    });

    const result = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    res.json({ success: true, count: result.length, recommendations: result });

  } catch (err) {
    console.error("[recommendations] ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;