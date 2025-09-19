import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import firstPlan from "./examples/first-plan.json";

// Step 1: Get plan JSON and query from user
const getPlanStep = createStep({
  id: "get-plan",
  inputSchema: z.object({}),
  outputSchema: z.object({
    planJson: z.optional(z.string()),
    query: z.optional(z.string()),
  }),
  resumeSchema: z.object({
    planJson: z.optional(z.string()),
    query: z.optional(z.string()),
  }),
  suspendSchema: z.object({
    message: z.object({
      query: z.string(),
    }),
  }),
  execute: async ({ resumeData }) => {
    return {
      planJson: resumeData?.planJson || JSON.stringify(firstPlan),
      query: resumeData?.query || "ChatGPT和Claude在编程能力上谁更厉害",
    };
  },
});

// Step 2: Execute plan with master agent
const executePlanStep = createStep({
  id: "execute-plan",
  inputSchema: z.object({
    planJson: z.string(),
    query: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { planJson, query } = inputData;

    try {
      const agent = mastra!.getAgent("masterAgent");

      const stream = await agent.streamVNext([
        {
          role: "user",
          content: query,
        },
        {
          role: "assistant",
          content: [
            {
              type: "tool-call",
              toolCallId: "call_plan",
              toolName: "plan",
              input: "",
            },
          ],
        },
        {
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: "call_plan",
              toolName: "plan",
              output: { type: "text", value: planJson },
            },
          ],
        },
        {
          role: "user",
          content: "CONFIRM",
        },
      ]);

      let fullResult = "";

      for await (const chunk of stream.textStream) {
        fullResult += chunk;
        process.stdout.write(chunk);
      }

      return {
        result: fullResult,
      };
    } catch (error: any) {
      console.log({ error });
      return {
        result: `Error: ${error.message}`,
      };
    }
  },
});

// Define the workflow
export const researchWorkflow = createWorkflow({
  id: "master-test-workflow",
  inputSchema: z.object({}),
  outputSchema: z.object({
    result: z.string(),
  }),
  steps: [getPlanStep, executePlanStep],
});

researchWorkflow.then(getPlanStep).then(executePlanStep).commit();
