import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const productManagerAgentTool = createTool({
  id: "product_manager_agent",
  description: "调用产品经理代理来确定产品功能、目标和方向，撰写PRD和roadmap文档",
  inputSchema: z.object({
    query: z.string().describe("产品规划需求"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("产品规划结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub product manager tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("productManagerAgent");

      console.log(`Starting product planning for: "${query}"`);

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
      console.log("Product planning completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub product manager tool:", error);
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