import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Exa from "exa-js";
import "dotenv/config";

const exa = new Exa(process.env.EXA_API_KEY);

export const webCrawlTool = createTool({
  id: "web_crawl",
  description: "针对特定URL列表在网络上爬取信息并返回内容",
  inputSchema: z.object({
    urls: z.array(z.string()).describe("The URLs to crawl"),
  }),
  execute: async ({ context, mastra }) => {
    console.log("Executing web crawl tool");
    const { urls } = context;

    try {
      if (!process.env.EXA_API_KEY) {
        console.error("Error: EXA_API_KEY not found in environment variables");
        return { results: [], error: "Missing API key" };
      }

      console.log(`Crawling web for: "${urls.join(", ")}"`);
      const result = await exa.getContents(urls, {
        text: true,
      });

      if (!result || result.results.length === 0) {
        console.log("No crawl results found");
        return { results: [], error: "No results found" };
      }

      console.log(
        `Found ${result.results.length} crawl results, summarizing content...`,
      );

      return { result, error: null };
    } catch (error) {
      console.error("Error crawling the web:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      return {
        result: [],
        error: errorMessage,
      };
    }
  },
});
