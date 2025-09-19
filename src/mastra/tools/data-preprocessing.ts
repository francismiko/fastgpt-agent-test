import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const dataPreprocessingTool = createTool({
  id: "data_preprocessing",
  description: "数据清洗和预处理",
  inputSchema: z.object({
    data: z.array(z.record(z.any())).describe("原始数据集"),
    operations: z.array(z.enum(["remove_duplicates", "handle_missing", "normalize", "encode_categorical"])).describe("预处理操作"),
    columns: z.array(z.string()).optional().describe("要处理的列名"),
  }),
  outputSchema: z.object({
    processedData: z.array(z.record(z.any())).describe("处理后的数据"),
    summary: z.string().describe("处理总结"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context }) => {
    const { data, operations, columns } = context;

    console.log(`Preprocessing data with operations: ${operations.join(", ")}...`);

    try {
      // 模拟数据预处理
      await new Promise(resolve => setTimeout(resolve, 150));

      // 简单的数据处理模拟
      let processedData = [...data];

      const summary = `数据预处理完成:
- 原始数据: ${data.length} 条记录
- 执行操作: ${operations.join(", ")}
- 处理列: ${columns?.join(", ") || "所有列"}
- 处理后数据: ${processedData.length} 条记录`;

      return {
        processedData,
        summary,
        error: null,
      };
    } catch (error) {
      console.error("Data preprocessing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown preprocessing error";

      return {
        processedData: [],
        summary: "预处理失败",
        error: errorMessage,
      };
    }
  },
});