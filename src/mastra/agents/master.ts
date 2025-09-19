import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { glm } from "../provider";
import { masterAgentPrompt } from "../prompts/master";
import { researchAgentTool } from "../tools/sub-research";
import { planAgentTool } from "../tools/sub-plan";
import { sandboxAgentTool } from "../tools/sub-sandbox";
import { reportAgentTool } from "../tools/sub-report";
import { dataScientistAgentTool } from "../tools/sub-data-scientist";
import { evaluationAgentTool } from "../tools/sub-evaluation";
import { productManagerAgentTool } from "../tools/sub-product-manager";
import { frontendDeveloperAgentTool } from "../tools/sub-frontend-developer";

export const masterAgent = new Agent({
  name: "Master Agent",
  instructions: masterAgentPrompt,
  model: glm["4.5"],
  tools: {
    researchAgentTool,
    planAgentTool,
    sandboxAgentTool,
    reportAgentTool,
    dataScientistAgentTool,
    evaluationAgentTool,
    productManagerAgentTool,
    frontendDeveloperAgentTool
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
