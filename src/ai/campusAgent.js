import { AgentBuilder } from "@iqai/adk";
import pkg from "@iqai/adk";
const { createTool } = pkg;
import { z } from "zod";
import Student from "../model/studentModel.js";

const agentCache = new Map();

export async function getCampusAgent(userId) {
  if (agentCache.has(userId)) return agentCache.get(userId);

  // Fetch profile
  const student = await Student.findById(userId)
    .populate("collage", "name")
    .select("name skills interests branch currentYear cgpa openTo headline");

  const profile = student ? `
[User Profile]
Name: ${student.name}
Branch: ${student.branch || "N/A"}
Year: ${student.currentYear || "N/A"}
CGPA: ${student.cgpa || "N/A"}
Skills already known: ${student.skills?.join(", ") || "none"}
Interests: ${student.interests?.join(", ") || "none"}
Open to: ${student.openTo?.join(", ") || "N/A"}
College: ${student.collage?.name || "N/A"}
` : "";

  // ── Tools defined inside getCampusAgent so userId is from closure ──

  const suggestPeopleTool = createTool({
    name: "suggest_people",
    description: "Suggest students with matching skills. Use this for learning/career questions.",
    schema: z.object({
      skills: z.array(z.string()).describe("Skill keywords to search e.g. ['React', 'Figma']"),
    }),
    fn: async ({ skills }) => {
      try {
        console.log("[suggest_people] userId from closure:", userId, "skills:", skills);
        const skillRegexes = skills.map(s => new RegExp(s, "i"));

        // Friends
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

        // Others
        const excludeIds = [userId, ...friends.map(f => f._id?.toString())];
        const others = await Student.find({
          _id: { $nin: excludeIds },
          skills: { $in: skillRegexes },
        })
        .populate("collage", "name")
        .select("name headline skills branch currentYear collage _id")
        .limit(5).lean();

        console.log("[suggest_people] friends:", friends.length, "others:", others.length);

        const fmt = (s, isConn) => ({
          name: s.name,
          headline: s.headline || "",
          skills: s.skills?.slice(0, 4),
          college: s.collage?.name || "N/A",
          year: s.currentYear,
          isConnection: isConn,
        });

        if (friends.length === 0 && others.length === 0) {
          return JSON.stringify({ found: false, message: "No students found with these skills on the platform yet." });
        }

        return JSON.stringify({
          found: true,
          friends: friends.map(s => fmt(s, true)),
          others:  others.map(s => fmt(s, false)),
        });
      } catch (err) {
        console.error("[suggest_people] ERROR:", err.message);
        return JSON.stringify({ found: false, message: "Could not fetch students." });
      }
    },
  });

  const searchStudentsTool = createTool({
    name: "search_students",
    description: "Search all students by skills or interests.",
    schema: z.object({
      skills:    z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      limit:     z.number().optional().default(5),
    }),
    fn: async ({ skills, interests, limit }) => {
      try {
        const query = { _id: { $ne: userId } };
        const or = [];
        if (skills?.length)    or.push({ skills:    { $in: skills.map(s => new RegExp(s, "i")) } });
        if (interests?.length) or.push({ interests: { $in: interests.map(i => new RegExp(i, "i")) } });
        if (or.length) query.$or = or;

        const students = await Student.find(query)
          .populate("collage", "name")
          .select("name headline skills branch currentYear collage _id")
          .limit(limit).lean();

        console.log("[search_students] found:", students.length);
        return JSON.stringify(students.map(s => ({
          name: s.name, headline: s.headline,
          skills: s.skills, college: s.collage?.name,
          branch: s.branch, year: s.currentYear,
        })));
      } catch (err) {
        console.error("[search_students] ERROR:", err.message);
        return JSON.stringify([]);
      }
    },
  });

  const { runner } = await AgentBuilder
    .create("campus_bot")
    .withModel("gemini-2.5-flash")
    .withInstruction(`
You are CampusBot, a helpful AI assistant for college students.
${profile}

CRITICAL: Never repeat or duplicate any part of your response. Write everything ONCE only.

For general questions: answer directly like ChatGPT, no tools needed.

For learning/career questions (how to learn X, roadmap, what to study, career advice):
- Give complete personalized answer based on user profile (skip skills they already know)
- Then call suggest_people tool with relevant skill keywords
- Add results at the end under "---\\nYeh platform pe is field ke students hain:"
- If found:false → write "Abhi platform pe is skill ke students nahi hain."

For "find people" questions: call suggest_people or search_students directly.

Never say "technical issue". Reply in same language as user.
    `)
    .withTools(suggestPeopleTool, searchStudentsTool)
    .withQuickSession({ state: {} })
    .build();

  agentCache.set(userId, runner);
  setTimeout(() => agentCache.delete(userId), 2 * 60 * 60 * 1000);
  return runner;
}