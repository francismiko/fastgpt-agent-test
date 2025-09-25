import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { planAgent } from "./agents/plan";
import { masterAgent } from "./agents/master";
import { researchAgent } from "./agents/research";
import { sandboxAgent } from "./agents/sandbox";
import { reportAgent } from "./agents/report";
import { dataScientistAgent } from "./agents/data-scientist";
import { evaluationAgent } from "./agents/evaluation";
import { productManagerAgent } from "./agents/product-manager";
import { frontendDeveloperAgent } from "./agents/frontend-developer";
import { agentWorkflow } from "./workflows/agent-workflow";
import { replanAgent } from "./agents/replan";

export const mastra = new Mastra({
  workflows: { agentWorkflow },
  agents: {
    planAgent,
    replanAgent,
    masterAgent,
    researchAgent,
    sandboxAgent,
    reportAgent,
    dataScientistAgent,
    evaluationAgent,
    productManagerAgent,
    frontendDeveloperAgent,
  },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
