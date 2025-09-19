
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { planAgent } from './agents/plan';
import { masterAgent } from './agents/master';
import { researchWorkflow } from './workflows/master-test';
import { researchAgent } from './agents/research';

export const mastra = new Mastra({
  workflows: { researchWorkflow },
  agents: { planAgent, masterAgent, researchAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
