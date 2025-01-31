import type { ZodType } from "zod";
import type { Tool } from "ai";

export type ToolsetteAuth = {
  type: "Bearer";
  apiKey: string;
};

export type ToolsetteTool = {
  parameters: ZodType<{}>;
  function: (...args: any[]) => Promise<unknown>;
  name: string;
  description: string;
  metadata?: {
    auth: ToolsetteAuth;
  };
};

export const format = (tools: ToolsetteTool[], provider: "ai-sdk") => {
  if (provider !== "ai-sdk") {
    throw new Error(`Provider not supported ${provider}`);
  }

  let formattedTools: Record<string, Tool> = {};

  tools.forEach((tool) => {
    formattedTools[tool.name] = {
      type: "function" as const,
      parameters: tool.parameters,
      description: tool.description,
      execute: async (args, opt) => {
        const res = await tool.function(args, tool.metadata);

        return res;
      },
    };
  });

  return formattedTools;
};

export const withAuth = (
  tools: ToolsetteTool[],
  auth: ToolsetteAuth
): ToolsetteTool[] => {
  return tools.map((tool) => ({
    ...tool,
    metadata: {
      auth,
    },
  }));
};
