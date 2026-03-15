import express from "express";
import Student from "../model/studentModel.js";
import Post from "../model/postModel.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, students: [], posts: [] });
    }

    const query = q.trim();
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [students, posts] = await Promise.all([
      // Students — name, headline, branch, skills se search
      Student.find({
        $or: [
          { name:     { $regex: regex } },
          { headline: { $regex: regex } },
          { branch:   { $regex: regex } },
          { skills:   { $in: [regex] } },
        ],
      })
      .populate("collage", "name")
      .select("name headline avatar branch currentYear collage isVerified _id")
      .limit(5)
      .lean(),

      // Posts — title, content, tags se search
      Post.find({
        $or: [
          { title:   { $regex: regex } },
          { content: { $regex: regex } },
          { tags:    { $in: [regex] } },
        ],
      })
      .populate("createdBy", "name avatar")
      .select("title content tags createdAt createdBy _id")
      .limit(5)
      .lean(),
    ]);

    res.json({
      success: true,
      students: students.map(s => ({
        _id:      s._id,
        name:     s.name,
        headline: s.headline || "",
        avatar:   s.avatar || null,
        branch:   s.branch || "",
        year:     s.currentYear || "",
        college:  s.collage?.name || "",
        verified: s.isVerified || false,
      })),
      posts: posts.map(p => ({
        _id:     p._id,
        title:   p.title || p.content?.slice(0, 60) || "",
        content: p.content?.slice(0, 100) || "",
        tags:    p.tags || [],
        author:  p.createdBy?.name || "",
        avatar:  p.createdBy?.avatar || null,
        date:    p.createdAt,
      })),
    });
  } catch (err) {
    console.error("[search] ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;