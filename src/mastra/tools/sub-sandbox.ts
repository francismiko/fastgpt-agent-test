import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const sandboxAgentTool = createTool({
  id: "sandbox_agent",
  description: "调用沙箱代理来安全执行代码并返回执行结果",
  inputSchema: z.object({
    query: z.string().describe("代码执行请求或调试需求"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("执行结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing sub sandbox tool");
    const { query } = context;

    try {
      const agent = mastra!.getAgent("sandboxAgent");

      console.log(`Starting code execution for: "${query}"`);

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
      console.log("Code execution completed successfully");

      return {
        result: fullOutput.text,
        error: null,
      };
    } catch (error) {
      console.error("Error in sub sandbox tool:", error);
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