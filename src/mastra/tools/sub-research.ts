import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const researchAgentTool = createTool({
  id: "research_agent",
  description: "调用研究代理来深度调查特定主题并返回详细的调研结果",
  inputSchema: z.object({
    query: z.string().describe("要研究的主题或问题"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("研究结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub research tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("researchAgent");

      console.log(`Starting research for: "${query}"`);

      const stream = await agent.streamVNext(
        [
          {
            role: "user",
            content: query,
          },
        ],
        { modelSettings: { temperature: 0.7 } },
      );

      for await (const chunk of stream.textStream) {
        process.stdout.write(chunk);
      }
      process.stdout.write("\n");

      const fullOutput = await stream.getFullOutput();
      console.log("Research completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub research tool:", error);
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
