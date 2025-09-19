import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const codeExecutionTool = createTool({
  id: "code_execution",
  description: "在安全的沙箱环境中执行代码",
  inputSchema: z.object({
    code: z.string().describe("要执行的代码"),
    language: z.string().describe("编程语言（如: javascript, python, java等）"),
    timeout: z.number().optional().describe("执行超时时间（秒），默认30秒"),
  }),
  outputSchema: z.object({
    result: z.string().nullable().describe("执行结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
    executionTime: z.number().describe("执行时间（毫秒）"),
  }),
  execute: async ({ context }) => {
    const { code, language, timeout = 30 } = context;

    console.log(`Executing ${language} code in sandbox...`);

    try {
      const startTime = Date.now();

      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 100));

      const executionTime = Date.now() - startTime;

      return {
        result: `模拟执行结果: ${language} 代码执行成功\n代码长度: ${code.length} 字符`,
        error: null,
        executionTime,
      };
    } catch (error) {
      console.error("Code execution error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown execution error";

      return {
        result: null,
        error: errorMessage,
        executionTime: 0,
      };
    }
  },
});