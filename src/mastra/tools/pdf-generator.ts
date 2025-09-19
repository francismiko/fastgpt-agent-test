import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const pdfGeneratorTool = createTool({
  id: "pdf_generator",
  description: "创建PDF格式的报告文档",
  inputSchema: z.object({
    title: z.string().describe("文档标题"),
    content: z.string().describe("文档内容（支持Markdown格式）"),
    template: z.string().optional().describe("文档模板"),
    includeCharts: z.boolean().optional().describe("是否包含图表"),
  }),
  outputSchema: z.object({
    fileUrl: z.string().nullable().describe("生成的PDF文件URL"),
    pageCount: z.number().describe("页面数量"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context }) => {
    const { title, content, template = "default", includeCharts = false } = context;

    console.log(`Generating PDF: ${title}...`);

    try {
      // 模拟PDF生成
      await new Promise(resolve => setTimeout(resolve, 300));

      const pageCount = Math.ceil(content.length / 2000) + (includeCharts ? 2 : 0);

      return {
        fileUrl: `https://example.com/pdf/${Date.now()}.pdf`,
        pageCount,
        error: null,
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown PDF error";

      return {
        fileUrl: null,
        pageCount: 0,
        error: errorMessage,
      };
    }
  },
});