import { Agent } from "@mastra/core/agent";
import { glm } from "../provider";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { dataAnalysisTool } from "../tools/data-analysis";
import { dataPreprocessingTool } from "../tools/data-preprocessing";
import { dataScientistAgentPrompt } from "../prompts/data-scientist";

export const dataScientistAgent = new Agent({
  name: "Data Scientist Agent",
  instructions: dataScientistAgentPrompt,
  model: glm["4.5"],
  tools: {
    dataAnalysisTool,
    dataPreprocessingTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});