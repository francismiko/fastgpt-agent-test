import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { claude } from "../provider";
import { planAgentPromptV2 } from "../prompts/plan";

export const planAgent = new Agent({
  name: "Plan Agent",
  instructions: planAgentPromptV2,
  model: claude["sonnet"],
  // tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
