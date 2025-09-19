import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const evaluationAgentTool = createTool({
  id: "evaluation_agent",
  description: "调用评估代理来评估任务执行结果",
  inputSchema: z.object({
    query: z.string().describe("评估请求，包含任务结果和评估标准"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("评估结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub evaluation tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("evaluationAgent");

      console.log(`Starting evaluation for: "${query}"`);

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
      console.log("Evaluation completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub evaluation tool:", error);
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