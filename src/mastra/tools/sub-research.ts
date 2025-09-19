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

      const researchPrompt = `请对以下主题进行深入研究："${query}"

请使用以下两阶段流程：
阶段1：使用web_search工具搜索2-3个初始查询来获取基础信息
阶段2：基于阶段1的学习成果，进行后续搜索以获得更深入的见解

最终返回一个清晰的研究总结，包括：
- 主要发现
- 关键信息点
- 参考来源`;

      const stream = await agent.streamVNext([
        {
          role: "user",
          content: researchPrompt,
        },
      ]);

      let fullResult = "";

      for await (const chunk of stream.textStream) {
        fullResult += chunk;
        process.stdout.write(chunk);
      }

      console.log("Research completed successfully");

      return {
        result: fullResult,
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
