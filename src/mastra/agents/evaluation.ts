import { Agent } from "@mastra/core/agent";
import { glm } from "../provider";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { evaluationAgentPrompt } from "../prompts/evaluation";

export const evaluationAgent = new Agent({
  name: "Evaluation Agent",
  instructions: evaluationAgentPrompt,
  model: glm["4.5"],
  tools: {},
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});