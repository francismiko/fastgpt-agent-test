import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

/*
  整体流程:
  1. 计划制定 (Plan)
  2. 主任务执行 (Master Execution)
  3. 条件判断 (Condition Check) 判断 plan 中 requires_replan 字段
     - 如果需要重新计划 (requires_replan=true) -> 重新计划 (Replan) -> 回到主任务执行 (Master Execution)
     - 如果不需要重新计划 (requires_replan=false) ->  master 输出结果 -> 结束
 */
const execPlanStep = createStep({
  id: "exec-plan",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    newPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const { query } = inputData;

    const agent = mastra.getAgent("planAgent");
    const stream = await agent.streamVNext(
      [
        {
          role: "user",
          content: query,
        },
      ],
      { modelSettings: { temperature: 0 }, maxSteps: 100 },
    );

    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
    process.stdout.write("\n");

    const fullOutput = await stream.getFullOutput();

    // 保存 plan 内容到 Markdown 文件
    try {
      const dataDir = path.join(__dirname, "../data");
      await fs.mkdir(dataDir, { recursive: true });

      await fs.writeFile(
        path.join(dataDir, "plans.md"),
        fullOutput.text,
        "utf8",
      );
      console.log("Plan saved to ../data/plans.md");
    } catch (error) {
      console.error("Failed to save plan:", error);
    }

    return {
      newPlan: fullOutput.text,
      masterHistory: [
        {
          role: "user",
          content: fullOutput.text,
        },
      ],
    };
  },
});

const execMasterStep = createStep({
  id: "exec-master",
  inputSchema: z.object({
    newPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
  outputSchema: z.object({
    newPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const { newPlan } = inputData;

    const agent = mastra.getAgent("masterAgent");

    const stream = await agent.streamVNext(
      [
        {
          role: "user",
          content: newPlan,
        },
      ],
      {
        context: inputData.masterHistory.length
          ? (inputData.masterHistory as any)
          : undefined,
        modelSettings: { temperature: 0 },
        maxSteps: 100,
      },
    );

    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
    process.stdout.write("\n");

    const result = await stream.getFullOutput();

    const newHistory = [
      ...inputData.masterHistory,
      ...result.response.messages,
    ];

    // 保存 master history 到 JSON 和 Markdown 文件
    try {
      const dataDir = path.join(__dirname, "../data");
      await fs.mkdir(dataDir, { recursive: true });

      // 保存 JSON 文件
      await fs.writeFile(
        path.join(dataDir, "master-history.json"),
        JSON.stringify(newHistory, null, 2),
        "utf8",
      );

      // 保存 Markdown 文件 - 只保留文字内容，过滤掉JSON结构
      const historyMarkdown = newHistory
        .map((msg) => {
          let content = "";
          if (typeof msg.content === "string") {
            content = msg.content;
          } else if (Array.isArray(msg.content)) {
            // 处理History数组结构，只提取text内容
            content = msg.content
              .filter((item: any) => item.type === "reasoning" && item.text)
              .map((item: any) => item.text)
              .join("\n\n");

            // 如果没有reasoning内容，尝试提取tool-result中的文本
            if (!content) {
              const toolResults = msg.content
                .filter(
                  (item: any) =>
                    item.type === "tool-result" && item.output?.value?.result,
                )
                .map((item: any) => item.output.value.result)
                .filter(
                  (result: any) => typeof result === "string" && result.trim(),
                )
                .join("\n\n");

              if (toolResults) {
                content = toolResults;
              }
            }
          } else if (msg.content && typeof msg.content === "object") {
            // 如果是其他对象类型，尝试提取文本字段
            if (msg.content.text) {
              content = msg.content.text;
            } else if (msg.content.result) {
              content = msg.content.result;
            }
          }

          // 如果仍然没有内容，跳过这条消息
          if (!content || !content.trim()) {
            return null;
          }

          return `**${msg.role}**:\n\n${content.trim()}`;
        })
        .filter((msg) => msg !== null) // 过滤掉空消息
        .join("\n\n---\n\n");

      await fs.writeFile(
        path.join(dataDir, "master-history.md"),
        historyMarkdown,
        "utf8",
      );

      console.log(
        "Master history saved to ../data/master-history.json and ../data/master-history.md",
      );
    } catch (error) {
      console.error("Failed to save master history:", error);
    }

    return {
      newPlan,
      masterHistory: newHistory,
    };
  },
});

const execReplanStep = createStep({
  id: "exec-replan",
  inputSchema: z.object({
    prevPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
  outputSchema: z.object({
    newPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const { prevPlan } = inputData;

    const agent = mastra.getAgent("replanAgent");

    const stream = await agent.streamVNext(
      [
        {
          role: "user",
          content: "根据之前的计划，结合最新的执行反馈，更新计划",
        },
      ],
      {
        context: inputData.masterHistory.length
          ? (inputData.masterHistory as any)
          : undefined,
        modelSettings: { temperature: 0 },
        maxSteps: 100,
      },
    );

    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
    process.stdout.write("\n");

    const result = await stream.getFullOutput();

    const newHistory = [
      ...inputData.masterHistory,
      {
        role: "user",
        content: result.text,
      },
    ];

    // 追加 replan 内容到 Markdown 文件
    try {
      const dataDir = path.join(__dirname, "../data");
      await fs.mkdir(dataDir, { recursive: true });

      const plansFilePath = path.join(dataDir, "plans.md");

      // 追加 replan 内容到文件
      const replanContent = `\n\n---\n\n${result.text}`;

      await fs.appendFile(plansFilePath, replanContent, "utf8");
      console.log("Replan added to ../data/plans.md");
    } catch (error) {
      console.error("Failed to save replan:", error);
    }

    return {
      newPlan: result.text || "default plan",
      masterHistory: newHistory,
    };
  },
});

const loopWorkflow = createWorkflow({
  id: "loop-workflow",
  inputSchema: z.object({
    newPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
  outputSchema: z.object({
    newPlan: z.string(),
    masterHistory: z.array(
      z.object({
        role: z.string(),
        content: z.any(),
      }),
    ),
  }),
})
  .then(execMasterStep)
  .map(async ({ inputData }) => {
    const { newPlan } = inputData;
    return { prevPlan: newPlan, ...inputData };
  })
  .then(execReplanStep)
  .commit();

export const agentWorkflow = createWorkflow({
  id: "agent-workflow",
  description:
    "Agent workflow with plan, master execution, and conditional replanning",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    finalResult: z.string(),
  }),
})
  .then(execPlanStep)
  .dountil(loopWorkflow, async ({ inputData }) => {
    const { newPlan } = inputData;
    const regex = /"requires_replan":\s*false/;
    const hasMatch = regex.test(newPlan);
    return hasMatch;
  })
  .map(async ({ inputData }) => {
    const { newPlan } = inputData;
    return { plan: newPlan, ...inputData };
  })
  .then(execMasterStep)
  .commit();
