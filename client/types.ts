import { type FunctionCall } from "@google/genai";

export interface Tool {
  name: string;
  description: string | undefined;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
    default?: any;
  };
}

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{
    text: string;
    type: string;
    functionCall?: FunctionCall;
  }>;
}

export interface ToolResult {
  content: Array<{
    text: string;
    type?: string;
  }>;
}