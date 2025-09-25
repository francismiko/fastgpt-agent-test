import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { glm, qwen } from "../provider";
import { masterAgentPrompt } from "../prompts/master";
import { researchAgentTool } from "../tools/sub-research";
import { sandboxAgentTool } from "../tools/sub-sandbox";
import { reportAgentTool } from "../tools/sub-report";
import { dataScientistAgentTool } from "../tools/sub-data-scientist";
import { evaluationAgentTool } from "../tools/sub-evaluation";
import { productManagerAgentTool } from "../tools/sub-product-manager";
import { frontendDeveloperAgentTool } from "../tools/sub-frontend-developer";
import { getWeatherTool } from "../tools/get-weather";
import { webCrawlTool } from "../tools/web-crawl";
import { webSearchTool } from "../tools/web-search";
import { LibSQLStore } from "@mastra/libsql";

export const masterAgent = new Agent({
  name: "Master Agent",
  instructions: masterAgentPrompt,
  model: glm["4.5"],
  tools: {
    researchAgentTool,
    // sandboxAgentTool,
    // reportAgentTool,
    // dataScientistAgentTool,
    // evaluationAgentTool,
    // productManagerAgentTool,
    // frontendDeveloperAgentTool,
    getWeatherTool,
    // webCrawlTool,
    // webSearchTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
