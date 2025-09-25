import { Agent } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { glm, gpt, qwen } from "../provider";
import fs from "fs/promises";
import path from "path";

export const interactivePromptTool = createTool({
  id: "interactive_prompt",
  description:
    "当需要用户提供更多细节或澄清时，请使用此工具。它允许助手提出开放式问题或提供多项选择，然后等待用户的回应后再继续。尽量使用 single_choice 模式, 而不是 input 模式, 因为用户更喜欢从选项中选择而不是自由输入。 可以多次调用此工具, 直到用户提供足够的信息或作出选择。",
  inputSchema: z.object({
    user_query: z.string().describe("用户输入的查询"),
    mode: z
      .enum(["input", "single_choice"])
      .describe("交互模式，input 表示自由输入，single_choice 表示单选"),
    prompt: z.string().describe("要展示给用户的问题或提示语"),
    options: z
      .array(z.string())
      .optional()
      .describe("当模式为 single_choice 时，需要提供的可选项列表"),
  }),
  outputSchema: z.object({
    result: z.string().describe("用户交互返回的结果"),
    error: z.string().nullable().describe("错误信息，如果有"),
  }),
  execute: async ({ context }) => {
    console.log("Executing interactive prompt tool");
    const { user_query, mode, prompt, options } = context;

    try {
      const agent = new Agent({
        name: "Mock Ask Agent",
        instructions:
          "由你扮演用户的角色代替用户模拟输出交互结果, 如果是选项, 请只输出选项中的内容, 禁止输出任何其他无关内容",
        model: glm["4.5"],
      });

      console.log(JSON.stringify({ mode, prompt, options }));

      const stream = await agent.streamVNext(
        [
          { role: "user", content: user_query },
          { role: "user", content: JSON.stringify({ mode, prompt, options }) },
        ],
        { modelSettings: { temperature: 0.9 } },
      );

      for await (const chunk of stream.textStream) {
        process.stdout.write(chunk);
      }
      process.stdout.write("\n");

      const fullOutput = await stream.getFullOutput();

      // 记录交互内容到 JSON 文件
      try {
        const dataDir = path.join(__dirname, "../data");
        await fs.mkdir(dataDir, { recursive: true });

        const interactiveLogPath = path.join(dataDir, "Interactive.json");

        // 创建日志条目
        const logEntry = {
          timestamp: new Date().toISOString(),
          user_query,
          mode,
          prompt,
          options: options || null,
          result: fullOutput.text,
          error: null,
        };

        // 读取现有日志或创建新的数组
        let existingLogs = [];
        try {
          const existingData = await fs.readFile(interactiveLogPath, "utf8");
          existingLogs = JSON.parse(existingData);
        } catch (error) {
          // 文件不存在或格式错误，使用空数组
          existingLogs = [];
        }

        // 添加新的日志条目
        existingLogs.push(logEntry);

        // 保存更新后的日志
        await fs.writeFile(
          interactiveLogPath,
          JSON.stringify(existingLogs, null, 2),
          "utf8",
        );

        console.log("Interactive log saved to ../data/Interactive.json");
      } catch (logError) {
        console.error("Failed to save interactive log:", logError);
      }

      return { result: fullOutput.text, error: null };
    } catch (error) {
      console.error("Error in interactive prompt tool:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);

      // 记录错误到 JSON 文件
      try {
        const dataDir = path.join(__dirname, "../data");
        await fs.mkdir(dataDir, { recursive: true });

        const interactiveLogPath = path.join(dataDir, "Interactive.json");

        // 创建错误日志条目
        const logEntry = {
          timestamp: new Date().toISOString(),
          user_query,
          mode,
          prompt,
          options: options || null,
          result: "",
          error: errorMessage,
        };

        // 读取现有日志或创建新的数组
        let existingLogs = [];
        try {
          const existingData = await fs.readFile(interactiveLogPath, "utf8");
          existingLogs = JSON.parse(existingData);
        } catch (logError) {
          // 文件不存在或格式错误，使用空数组
          existingLogs = [];
        }

        // 添加新的日志条目
        existingLogs.push(logEntry);

        // 保存更新后的日志
        await fs.writeFile(
          interactiveLogPath,
          JSON.stringify(existingLogs, null, 2),
          "utf8",
        );

        console.log("Interactive error log saved to ../data/Interactive.json");
      } catch (logError) {
        console.error("Failed to save interactive error log:", logError);
      }

      return { result: "", error: errorMessage };
    }
  },
});
