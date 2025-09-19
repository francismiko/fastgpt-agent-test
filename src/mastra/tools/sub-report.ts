import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const reportAgentTool = createTool({
  id: "report_agent",
  description: "调用报告代理来生成PPT/PDF/BI报告",
  inputSchema: z.object({
    query: z.string().describe("报告生成请求"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("报告生成结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub report tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("reportAgent");

      console.log(`Starting report generation for: "${query}"`);

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
      console.log("Report generation completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub report tool:", error);
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