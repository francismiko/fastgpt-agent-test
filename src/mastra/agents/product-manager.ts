import { Agent } from "@mastra/core/agent";
import { glm } from "../provider";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { productManagerAgentPrompt } from "../prompts/product-manager";

export const productManagerAgent = new Agent({
  name: "Product Manager Agent",
  instructions: productManagerAgentPrompt,
  model: glm["4.5"],
  tools: {},
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});