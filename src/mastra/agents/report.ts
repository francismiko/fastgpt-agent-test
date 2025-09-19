import { Agent } from "@mastra/core/agent";
import { glm } from "../provider";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { pptGeneratorTool } from "../tools/ppt-generator";
import { pdfGeneratorTool } from "../tools/pdf-generator";
import { chartGeneratorTool } from "../tools/chart-generator";
import { reportAgentPrompt } from "../prompts/report";

export const reportAgent = new Agent({
  name: "Report Agent",
  instructions: reportAgentPrompt,
  model: glm["4.5"],
  tools: {
    pptGeneratorTool,
    pdfGeneratorTool,
    chartGeneratorTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});