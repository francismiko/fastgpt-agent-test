import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import "dotenv/config";

export const getWeatherTool = createTool({
  id: "get_weather",
  description: "获取指定位置和日期的天气信息",
  inputSchema: z.object({
    location: z
      .string()
      .describe(
        "位置名称，例如：Beijing、Tokyo、New York. 城市名称必须要用英文",
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        "开始日期，格式为 YYYY-MM-DD，如果不提供则默认为未来 15 日天气",
      ),
    endDate: z
      .string()
      .optional()
      .describe(
        "结束日期，格式为 YYYY-MM-DD，如果不提供则默认为未来 15 日天气",
      ),
  }),
  execute: async ({ context }) => {
    console.log("Executing get weather tool");
    const { location, startDate, endDate } = context;

    try {
      if (!process.env.VISUAL_CROSSING_API_KEY) {
        console.error(
          "Error: VISUAL_CROSSING_API_KEY not found in environment variables",
        );
        return { weather: null, error: "Missing API key" };
      }

      // 构建 API URL
      let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}`;

      if (startDate) {
        url += `/${startDate}`;
        if (endDate) {
          url += `/${endDate}`;
        }
      }

      url += `?key=${process.env.VISUAL_CROSSING_API_KEY}&include=days`;

      console.log(`Fetching weather for: "${location}" from ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Weather API error: ${response.status} - ${errorText}`);
        return {
          weather: null,
          error: `Weather API error: ${response.status} - ${response.statusText}`,
        };
      }

      const weatherData = await response.json();

      console.log(`Successfully fetched weather data for ${location}`);

      return {
        weather: weatherData,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching weather:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      return {
        weather: null,
        error: errorMessage,
      };
    }
  },
});
