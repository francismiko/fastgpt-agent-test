import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const dataScientistAgentTool = createTool({
  id: "data_scientist_agent",
  description: "调用数据科学代理来进行数据分析和模型构建",
  inputSchema: z.object({
    query: z.string().describe("数据分析需求"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("分析结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub data scientist tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("dataScientistAgent");

      console.log(`Starting data analysis for: "${query}"`);

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
      console.log("Data analysis completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub data scientist tool:", error);
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