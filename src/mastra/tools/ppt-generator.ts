import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const pptGeneratorTool = createTool({
  id: "ppt_generator",
  description: "生成PowerPoint演示文稿",
  inputSchema: z.object({
    title: z.string().describe("演示文稿标题"),
    content: z.array(z.object({
      slideTitle: z.string().describe("幻灯片标题"),
      slideContent: z.string().describe("幻灯片内容"),
    })).describe("幻灯片内容列表"),
    template: z.string().optional().describe("模板样式"),
  }),
  outputSchema: z.object({
    fileUrl: z.string().nullable().describe("生成的PPT文件URL"),
    slideCount: z.number().describe("幻灯片数量"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context }) => {
    const { title, content, template = "default" } = context;

    console.log(`Generating PPT: ${title} with ${content.length} slides...`);

    try {
      // 模拟PPT生成
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        fileUrl: `https://example.com/ppt/${Date.now()}.pptx`,
        slideCount: content.length,
        error: null,
      };
    } catch (error) {
      console.error("PPT generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown PPT error";

      return {
        fileUrl: null,
        slideCount: 0,
        error: errorMessage,
      };
    }
  },
});