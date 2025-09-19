import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { claude, gpt, qwen } from "../provider";
import { planAgentPromptV2 } from "../prompts/plan";
import { interactivePromptTool } from "../tools/interactive-ask";

export const planAgent = new Agent({
  name: "Plan Agent",
  instructions: planAgentPromptV2,
  model: claude["sonnet"],
  tools: { interactivePromptTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
