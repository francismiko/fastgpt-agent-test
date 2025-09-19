import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const dataAnalysisTool = createTool({
  id: "data_analysis",
  description: "进行数据分析和统计计算",
  inputSchema: z.object({
    data: z.array(z.record(z.any())).describe("要分析的数据集"),
    analysisType: z.enum(["descriptive", "correlation", "regression", "clustering"]).describe("分析类型"),
    columns: z.array(z.string()).optional().describe("要分析的列名"),
  }),
  outputSchema: z.object({
    results: z.record(z.any()).describe("分析结果"),
    summary: z.string().describe("分析总结"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context }) => {
    const { data, analysisType, columns } = context;

    console.log(`Performing ${analysisType} analysis on ${data.length} records...`);

    try {
      // 模拟数据分析
      await new Promise(resolve => setTimeout(resolve, 200));

      const results = {
        recordCount: data.length,
        columnsAnalyzed: columns || Object.keys(data[0] || {}),
        analysisType,
        timestamp: new Date().toISOString(),
      };

      const summary = `完成 ${analysisType} 分析，处理了 ${data.length} 条记录。`;

      return {
        results,
        summary,
        error: null,
      };
    } catch (error) {
      console.error("Data analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown analysis error";

      return {
        results: {},
        summary: "分析失败",
        error: errorMessage,
      };
    }
  },
});