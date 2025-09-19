import { Agent } from "@mastra/core/agent";
import { glm } from "../provider";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { codeExecutionTool } from "../tools/code-execution";
import { sandboxAgentPrompt } from "../prompts/sandbox";

export const sandboxAgent = new Agent({
  name: "Sandbox Agent",
  instructions: sandboxAgentPrompt,
  model: glm["4.5"],
  tools: {
    codeExecutionTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});