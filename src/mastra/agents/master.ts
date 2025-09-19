import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { glm } from "../provider";
import { masterAgentPrompt } from "../prompts/master";
import { researchAgentTool } from "../tools/sub-research";

export const masterAgent = new Agent({
  name: "Master Agent",
  instructions: masterAgentPrompt,
  model: glm["4.5"],
  tools: { researchAgentTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
