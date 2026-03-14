import pkg from "@iqai/adk";
const { createTool } = pkg;
import { z } from "zod";
import Student from "../../model/studentModel.js";

export const searchStudentsTool = createTool({
  name: "search_students",
  description: "Search students by skills or interests.",
  schema: z.object({
    skills:    z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    limit:     z.number().optional().default(5),
  }),

  fn: async ({ userId, skills }) => {
  console.log("[suggest_people] CALLED skills:", skills, "userId:", userId);
  
  // Hardcoded test — koi bhi 5 students lao
  const all = await Student.find({ _id: { $ne: userId } })
    .limit(5).lean();
  
  console.log("[suggest_people] Total students found:", all.length);
  console.log("[suggest_people] Their skills:", all.map(s => s.skills));
  
  // Ab normal query
  const skillRegexes = skills.map(s => new RegExp(s, "i"));
  const others = await Student.find({
    _id: { $ne: userId },
    skills: { $in: skillRegexes },
  }).limit(5).lean();
  
  console.log("[suggest_people] Skill matched:", others.length);
  
  // baaki code same...
}

});