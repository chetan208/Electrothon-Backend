import cron from "node-cron";
import { runDailyOpportunityAgent } from "../ai/dailyOpportunityAgent.js";

export function startScheduler() {
  // Roz subah 9 baje chalega
  cron.schedule("0 9 * * *", async () => {
    console.log("[cron] Daily opportunity agent starting...");
    await runDailyOpportunityAgent();
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log("[cron] Scheduler started — daily at 9:00 AM IST");
}