import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const planAgentTool = createTool({
  id: "plan_agent",
  description: "调用计划代理来制定详细的任务计划和行动步骤",
  inputSchema: z.object({
    user_query: z.string().describe("用户输入的查询"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("计划结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub research tool");
    const { user_query: query } = context;

    try {
      const agent = mastra!.getAgent("planAgent");

      console.log(`Starting plan for: "${query}"`);

      const stream = await agent.streamVNext(
        [
          {
            role: "user",
            content: query,
          },
        ],
        { modelSettings: { temperature: 0 } },
      );

      for await (const chunk of stream.textStream) {
        process.stdout.write(chunk);
      }
      process.stdout.write("\n");

      const fullOutput = await stream.getFullOutput();

      console.log("Plan completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub plan tool:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);

      return {
        result: null,
        error: errorMessage,
      };
    }
  },
});
