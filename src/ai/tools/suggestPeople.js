import pkg from "@iqai/adk";
const { createTool } = pkg;
import { z } from "zod";
import Student from "../../model/studentModel.js";

export const suggestPeopleTool = createTool({
  name: "suggest_people",
  description: "Suggest students with matching skills. Friends shown first.",
  schema: z.object({
    userId: z.string(),
    skills: z.array(z.string()),
  }),
  fn: async ({ userId, skills }) => {
    try {
      console.log("[suggest_people] userId:", userId, "skills:", skills);

      // case-insensitive regex
      const skillRegexes = skills.map(s => new RegExp(s, "i"));

      let friends = [];
      try {
        const me = await Student.findById(userId).select("connections");
        const friendIds = me?.connections || [];
        if (friendIds.length > 0) {
          friends = await Student.find({
            _id: { $in: friendIds },
            skills: { $in: skillRegexes },
          })
          .populate("collage", "name")
          .select("name headline skills branch currentYear collage _id")
          .limit(3).lean();
        }
      } catch (e) {
        console.log("[suggest_people] friends skip:", e.message);
      }

      const excludeIds = [userId, ...friends.map(f => f._id?.toString())];
      const others = await Student.find({
        _id: { $nin: excludeIds },
        skills: { $in: skillRegexes },
        isVerified: true,
      })
      .populate("collage", "name")
      .select("name headline skills branch currentYear collage _id")
      .limit(5).lean();

      console.log("[suggest_people] friends:", friends.length, "others:", others.length);

      const format = (s, isConn) => ({
        name: s.name,
        headline: s.headline || "",
        skills: s.skills?.slice(0, 4),
        college: s.collage?.name || "N/A",
        year: s.currentYear,
        isConnection: isConn,
      });

      if (friends.length === 0 && others.length === 0) {
        return { found: false, message: "Abhi platform pe is skill ke students nahi hain." };
      }

      return {
        found: true,
        friends: friends.map(s => format(s, true)),
        others:  others.map(s => format(s, false)),
      };
    } catch (err) {
      console.error("[suggest_people] ERROR:", err.message);
      return { found: false, message: "Could not fetch students." };
    }
  },
});