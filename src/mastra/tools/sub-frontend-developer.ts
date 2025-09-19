import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const frontendDeveloperAgentTool = createTool({
  id: "frontend_developer_agent",
  description: "调用前端开发代理来生成前端代码、修改前端代码等",
  inputSchema: z.object({
    query: z.string().describe("前端开发需求"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("前端开发结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub frontend developer tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("frontendDeveloperAgent");

      console.log(`Starting frontend development for: "${query}"`);

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
      console.log("Frontend development completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub frontend developer tool:", error);
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