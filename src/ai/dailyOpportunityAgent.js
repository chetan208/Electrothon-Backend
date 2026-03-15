import { AgentBuilder } from "@iqai/adk";
import Student from "../model/studentModel.js";
import { notifyOpportunity } from "../utils/notificationHelper.js";

async function runDailyOpportunityAgent() {
  console.log("[daily-agent] Starting daily opportunity scan...");

  const students = await Student.find({ isProfileCompleted: true })
    .populate("collage", "name type")
    .select("_id name skills interests branch currentYear openTo collage")
    .lean();

  console.log(`[daily-agent] Processing ${students.length} students`);

  for (const student of students) {
    try {
      await processStudentOpportunity(student);
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.error(`[daily-agent] Error for ${student.name}:`, err.message);
    }
  }

  console.log("[daily-agent] Done!");
}

async function processStudentOpportunity(student) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata"
  });
  const currentYear = new Date().getFullYear();

  const profile = `
- Branch: ${student.branch || "N/A"}
- Year: ${student.currentYear || "N/A"}
- Skills: ${student.skills?.join(", ") || "none"}
- Interests: ${student.interests?.join(", ") || "none"}
- Open to: ${student.openTo?.join(", ") || "N/A"}
- College: ${student.collage?.name || "N/A"} (${student.collage?.type || ""})
`;

  // Student profile se preferred type decide karo
  const preferredType =
    student.openTo?.includes("hackathon")   ? "Hackathon"   :
    student.openTo?.includes("internship")  ? "Internship"  :
    student.openTo?.includes("project")     ? "Open Source" :
    student.openTo?.includes("research")    ? "Research"    : "any";

  const skillFocus     = student.skills?.slice(0, 3).join(", ")    || "programming";
  const interestFocus  = student.interests?.slice(0, 2).join(", ") || "technology";
  const hasOpenSource  = student.interests?.some(i => i.toLowerCase().includes("open source"));

  const result = await AgentBuilder
    .withModel("gemini-2.5-flash")
    .withInstruction(`
You are a real-time opportunity finder for Indian college students.
Today's date is ${today}.

You must find a UNIQUE opportunity tailored SPECIFICALLY to this student's profile.
Every student gets a DIFFERENT opportunity based on their skills and interests.

STRICT RULES:
1. Search the internet RIGHT NOW for a real currently-open opportunity.
2. The opportunity type should be: ${preferredType}
3. Match skills: ${skillFocus}
4. Deadline must be AFTER ${today} — do not suggest expired programs.
5. ${hasOpenSource ? "Student likes Open Source — you may suggest GSoC or similar." : "Do NOT suggest Google Summer of Code — find something more specific."}
6. Prefer SPECIFIC relevant opportunities over generic popular ones.
7. ALL field values must be real — no placeholders, no "check website", no example.com.
8. Link must be a real working URL to the application page.

Student profile:
${profile}

Return ONLY a JSON object:
{
  "title": "exact real name e.g. MLH Fellowship Spring ${currentYear}",
  "organization": "real org e.g. Major League Hacking",
  "type": "${preferredType}",
  "why": "1-2 specific lines mentioning their actual skills like ${skillFocus}",
  "deadline": "real date after ${today}",
  "link": "real direct URL",
  "notification_title": "max 60 chars catchy title",
  "notification_message": "max 120 chars engaging message"
}
    `)
    .ask(`Find one real ${preferredType} opportunity open after ${today} for a student skilled in ${skillFocus} interested in ${interestFocus}. Return JSON only with real data.`);

  let opportunity;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    opportunity = JSON.parse(jsonMatch[0]);

    // Strict placeholder check — only title and org
    const strictPlaceholders = ["opportunity name", "company name", "your skills", "example.com", "[link]", "[url]", "insert link"];
    const titleAndOrg = (opportunity.title + " " + opportunity.organization).toLowerCase();
    const hasPlaceholder = strictPlaceholders.some(p => titleAndOrg.includes(p));

    if (hasPlaceholder) {
      console.warn(`[daily-agent] Placeholder detected for ${student.name}: ${opportunity.title}`);
      return;
    }

    if (!opportunity.title || !opportunity.link || !opportunity.organization) {
      console.warn(`[daily-agent] Incomplete data for ${student.name}, skipping`);
      return;
    }

  } catch (e) {
    console.error(`[daily-agent] JSON parse failed for ${student.name}:`, e.message);
    return;
  }

  // ── Link bhi pass karo notification mein ──
  await notifyOpportunity({
    userId:          student._id,
    title:           opportunity.notification_title || `New: ${opportunity.title}`,
    message:         opportunity.notification_message || opportunity.why,
    link:            opportunity.link,              // ← real link
    opportunityData: opportunity,
  });

  console.log(`[daily-agent] ✓ ${student.name}: ${opportunity.title} | deadline: ${opportunity.deadline} | link: ${opportunity.link}`);
}

export { runDailyOpportunityAgent };