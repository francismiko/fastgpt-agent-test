import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { glm, qwen } from "../provider";
import { interactivePromptTool } from "../tools/interactive-ask";
import { replanAgentPrompt } from "../prompts/replan";

export const replanAgent = new Agent({
  name: "Replan Agent",
  instructions: replanAgentPrompt,
  model: glm["4.5"],
  tools: { interactivePromptTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
