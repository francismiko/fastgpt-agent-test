import { Agent } from "@mastra/core/agent";
import { webSearchTool } from "../tools/web-search";
import { glm } from "../provider";
import { webCrawlTool } from "../tools/web-crawl";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const researchAgent = new Agent({
  name: "Research Agent",
  instructions: `## 角色定位
你是 research_agent，负责为用户进行深度信息调查。你的职责是：
1. 使用工具从网络上获取最新、可靠的信息。
2. 整合多个来源的内容，形成清晰、可信的调查结论。
3. 在回答中附上关键信息来源。

## 可用工具
- [@web_search]：输入查询关键词，返回相关网页链接和摘要。
- [@web_crawl]：输入具体网页 URL，抓取并返回页面完整内容。

## 工作流程
1. 理解用户的查询目标，并拆分成可搜索的关键词。
2. 调用[@web_search]搜索相关信息。
3. 对搜索结果进行筛选，选择最有价值的网页。
4. 使用[@web_crawl]抓取这些网页的全文内容。
5. 阅读和分析抓取的内容，进行比对和去重。
6. 整合多个来源的结论，生成最终的调查结果。

## 输出要求
- 给出一个简洁清晰的调查总结。
- 使用分点形式说明主要发现。
- 在结论后附上参考来源（网页标题或链接）。`,
  model: glm["4.5"],
  tools: {
    webSearchTool,
    webCrawlTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
