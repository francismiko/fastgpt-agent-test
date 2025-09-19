import { Agent } from "@mastra/core/agent";
import { glm } from "../provider";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { frontendDeveloperAgentPrompt } from "../prompts/frontend-developer";

export const frontendDeveloperAgent = new Agent({
  name: "Frontend Developer Agent",
  instructions: frontendDeveloperAgentPrompt,
  model: glm["4.5"],
  tools: {},
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});