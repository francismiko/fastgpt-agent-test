import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Exa from "exa-js";
import "dotenv/config";

const exa = new Exa(process.env.EXA_API_KEY);

export const webSearchTool = createTool({
  id: "web_search",
  description: "在网络上搜索特定查询的信息并返回地址内容",
  inputSchema: z.object({
    query: z.string().describe("The search query to run"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing web search tool");
    const { query } = context;

    try {
      if (!process.env.EXA_API_KEY) {
        console.error("Error: EXA_API_KEY not found in environment variables");
        return { results: [], error: "Missing API key" };
      }

      console.log(`Searching web for: "${query}"`);
      const { results } = await exa.search(query);

      if (!results || results.length === 0) {
        console.log("No search results found");
        return { results: [], error: "No results found" };
      }

      console.log(
        `Found ${results.length} search results, summarizing content...`,
      );

      return { results, error: null };
    } catch (error) {
      console.error("Error searching the web:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      return {
        results: [],
        error: errorMessage,
      };
    }
  },
});
