import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const chartGeneratorTool = createTool({
  id: "chart_generator",
  description: "生成各种类型的数据可视化图表",
  inputSchema: z.object({
    chartType: z.enum(["bar", "line", "pie", "scatter", "area"]).describe("图表类型"),
    data: z.array(z.object({
      label: z.string().describe("数据标签"),
      value: z.number().describe("数据值"),
    })).describe("图表数据"),
    title: z.string().describe("图表标题"),
    options: z.object({
      width: z.number().optional().describe("图表宽度"),
      height: z.number().optional().describe("图表高度"),
      colors: z.array(z.string()).optional().describe("颜色配置"),
    }).optional().describe("图表选项"),
  }),
  outputSchema: z.object({
    chartUrl: z.string().nullable().describe("生成的图表URL"),
    chartConfig: z.string().describe("图表配置信息"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context }) => {
    const { chartType, data, title, options = {} } = context;

    console.log(`Generating ${chartType} chart: ${title}...`);

    try {
      // 模拟图表生成
      await new Promise(resolve => setTimeout(resolve, 150));

      const chartConfig = JSON.stringify({
        type: chartType,
        title,
        dataPoints: data.length,
        dimensions: {
          width: options.width || 800,
          height: options.height || 600,
        },
      });

      return {
        chartUrl: `https://example.com/charts/${chartType}_${Date.now()}.png`,
        chartConfig,
        error: null,
      };
    } catch (error) {
      console.error("Chart generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown chart error";

      return {
        chartUrl: null,
        chartConfig: "",
        error: errorMessage,
      };
    }
  },
});