import { createTool } from "@iqai/adk";
import { z } from "zod";
import Student from "../../model/studentModel.js";

export const getFriendsTool = createTool({
  name: "get_friends",
  description: "Get the current user's connections/friends with their profiles",
  schema: z.object({ userId: z.string() }),
  fn: async ({ userId }) => {
    const s = await Student.findById(userId)
      .populate("connections", "name headline avatar skills interests branch currentYear collage _id")
      .select("connections");
    return s?.connections || [];
  },
});