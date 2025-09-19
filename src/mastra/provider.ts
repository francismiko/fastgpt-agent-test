import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const providerGlobal = createOpenAICompatible({
  name: "sealos-ai-proxy-global",
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL ?? "",
});

const providerCN = createOpenAICompatible({
  name: "sealos-ai-proxy-cn",
  apiKey: process.env.OPENAI_API_KEY_CN,
  baseURL: process.env.OPENAI_BASE_URL_CN ?? "",
});

const claude = {
  haiku: providerGlobal("claude-3-5-haiku-20241022"),
  sonnet: providerGlobal("claude-sonnet-4-20250514"),
  opus: providerGlobal("claude-opus-4-1-20250805"),
};
const gpt = {
  "5": providerGlobal("gpt-5"),
  "5-mini": providerGlobal("gpt-5-mini"),
  "5-nano": providerGlobal("gpt-5-nano"),
  "o4-mini": providerGlobal("gpt-5-o4-mini"),
};
const qwen = {
  max: providerCN("qwen-max"),
};
const glm = {
  "4.5": providerCN("glm-4.5"),
};
const deepseek = {
  "v3.1": providerCN("deepseek-v3.1"),
};
const doubao = {
  "seed-1-6": providerCN("doubao-seed-1-6-250615"),
};

export { claude, gpt, qwen, glm, deepseek, doubao };
