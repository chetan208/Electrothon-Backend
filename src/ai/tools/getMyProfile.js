import { createTool } from "@iqai/adk";
import { z } from "zod";
import Student from "../../model/studentModel.js";

export const getMyProfileTool = createTool({
  name: "get_my_profile",
  description: "Get the current student's profile — skills, interests, branch, year, college",
  schema: z.object({ userId: z.string() }),
  fn: async ({ userId }) => {
    const s = await Student.findById(userId)
      .populate("collage", "name type state")
      .select("name skills interests branch currentYear cgpa openTo headline bio");
    if (!s) return { error: "Student not found" };
    return {
      name: s.name, skills: s.skills, interests: s.interests,
      branch: s.branch, year: s.currentYear, cgpa: s.cgpa,
      openTo: s.openTo, headline: s.headline, college: s.collage?.name,
    };
  },
});